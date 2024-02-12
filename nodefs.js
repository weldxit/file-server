const fs = require('fs-extra');
const mammoth = require('mammoth');
const axios = require('axios');

const folderPath = 'Z:\\January-2024\\01.01.24';  // Update with your actual folder path

async function convertAndSendText(filePath) {
  try {
    const { value } = await mammoth.extractRawText({ path: filePath, convertTo: 'text' });

    // Create a text file with the extracted content
    const textFilePath = filePath.replace(/\.docx$/, '.txt');
    await fs.writeFile(textFilePath, value, 'utf8');

    console.log(`Text file created: ${textFilePath}`);

    // Make a POST request with the extracted text
    const response = await axios.post('http://localhost:3000/saveText', {
      text: value,
    });
    console.log(`POST request successful. Response: ${response.data}`);
  } catch (error) {
    console.error(`Error processing file ${filePath}: ${error.message}`);
  }
}

async function processFolder(folderPath) {
  try {
    const files = await fs.readdir(folderPath);

    for (const file of files) {
      const filePath = `${folderPath}/${file}`;
      const isDirectory = (await fs.stat(filePath)).isDirectory();

      if (isDirectory) {
        await processFolder(filePath);  // Recursively process subfolders
      } else if (file.endsWith('.docx')) {
        try {
          await convertAndSendText(filePath);
        } catch (error) {
          console.error(`Error processing file ${filePath}: ${error.message}`);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading folder ${folderPath}: ${error.message}`);
  }
}

// Start processing the main folder
processFolder(folderPath);
