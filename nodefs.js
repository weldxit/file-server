const fs = require('fs').promises;
const path = require('path');
const mammoth = require('mammoth');
const axios = require('axios');
const sharp = require('sharp');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with your service account credentials
const serviceAccount = require('./biofloc-sns-27991-firebase-adminsdk-i4zpc-cee4735244.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'biofloc-sns-27991.appspot.com',
});

const folderPath = 'Z:\February';  // Update with your actual folder path

async function convertAndSendText(filePath) {
  try {
    const { value } = await mammoth.extractRawText({ path: filePath, convertTo: 'text' });

    // Create a text file with the extracted content
    // const textFilePath = filePath.replace(/\.docx$/, '.txt');
    // await fs.writeFile(textFilePath, value, 'utf8');

    // console.log(`Text file created: ${textFilePath}`);

    // Make a POST request with the extracted text
    const response = await axios.post('http://localhost:3000/saveText', {
      text: value,
    });
    console.log(`POST request successful. Response: ${response.data}`);
  } catch (error) {
    console.error(`Error processing file ${filePath}: ${error.message}`);
  }
}

async function compressAndUploadImage(imagePath) {
  try {
    // Compress and reduce image size using sharp
    const compressedImagePath = imagePath.replace(/\.jpg$/, '_compressed.jpg');
    await sharp(imagePath).jpeg({ quality: 80 }).toFile(compressedImagePath);

    console.log(`Image compressed: ${compressedImagePath}`);

    // Upload compressed image to Firebase Storage
    const bucket = admin.storage().bucket();
    const remoteImagePath = `thumbs/${path.basename(compressedImagePath)}`;
    await bucket.upload(compressedImagePath, {
      destination: remoteImagePath,
    });

    console.log(`Image uploaded to Firebase Storage: ${remoteImagePath}`);
  } catch (error) {
    console.error(`Error processing image ${imagePath}: ${error.message}`);
  }
}

async function processFolder(folderPath) {
  try {
    const files = await fs.readdir(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = await fs.stat(filePath);

      if (stats.isDirectory()) {
        await processFolder(filePath);  // Recursively process subfolders

        // Check if the current folder contains an "output" folder
        const outputFolderPath = path.join(filePath, 'output');
        if (await folderExists(outputFolderPath)) {
          const outputFiles = await fs.readdir(outputFolderPath);

          if (outputFiles.length === 1 && outputFiles[0].endsWith('.jpg')) {
            const imagePath = path.join(outputFolderPath, outputFiles[0]);
            await compressAndUploadImage(imagePath);
          }
        }
      } else if (file.endsWith('.docx')) {
        await convertAndSendText(filePath);
      }
    }
  } catch (error) {
    console.error(`Error reading folder ${folderPath}: ${error.message}`);
  }
}

// Helper function to check if a folder exists
async function folderExists(folderPath) {
  try {
    const stats = await fs.stat(folderPath);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}


// Start processing the main folder
processFolder(folderPath);
