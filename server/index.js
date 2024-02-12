const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const pool = require('./pool')
const cors = require('cors')
const path = require('path');
const app = express();
app.use(cors())
const port = 3000; // Change as needed

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Endpoint to handle POST requests
app.post('/saveText', async (req, res) => {
  try {
    const { text, creationTimestamp } = req.body;
    console.log( text, creationTimestamp )

    if (!text || !creationTimestamp) {
      return res.status(400).json({ error: 'Invalid request. Missing required data.' });
    }

    // Insert data into the database
    const insertQuery = 'INSERT INTO latepost (text_column, creation_timestamp) VALUES ($1, $2)';
    const values = [text, creationTimestamp];

    await pool.query(insertQuery, values);

    // Log information
    console.log('Text inserted into the database.');
    console.log(`Creation timestamp: ${creationTimestamp}`);

    res.status(200).json({ message: 'Text received and saved to the database successfully.' });
  } catch (error) {
    console.error(`Error saving text to the database: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.post('/receive-converted-text', (req, res) => {
  const convertedText = req.body.convertedText;
  console.log('Received Converted Text:', convertedText);

  // You can perform further processing or respond to the client as needed

  res.status(200).send('Text received successfully');
});

// app.post('/createFolderAndFiles', async (req, res) => {
//   try {
//     const basePath = 'Z:\February'; // Set your desired base path
//     const folderPath = `${basePath}/newFolder/output`;
//     const folderPath2 = `${basePath}/newFolder`;

//     // Create the folder
//     await fs.ensureDir(folderPath);

//     // Create two .docx files
//     await fs.writeFile(`${folderPath2}/slug.docx`, 'Content for slug.docx');
//     await fs.writeFile(`${folderPath2}/article.docx`, 'Content for article.docx');

//     res.status(200).json({ message: 'Folder and files created successfully.' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error creating folder and files.' });
//   }
// });

app.post('/createFolderAndFiles', async (req, res) => {
  try {
    const basePath = 'Z:\February';
    const baseFolderName = 'newFolder';
    let folderIndex = 1;
    let folderName = `${baseFolderName}`;

    // Check for existing folders and find a unique name
    while (await fs.pathExists(path.join(basePath, folderName))) {
      folderIndex++;
      folderName = `${baseFolderName}${folderIndex}`;
    }

    const folderPath = path.join(basePath, folderName, 'output');

    // Create the folder
    await fs.ensureDir(folderPath);

    // Create two .docx files
    await fs.writeFile(path.join(folderPath, 'slug.docx'), 'Content for slug.docx');
    await fs.writeFile(path.join(folderPath, 'article.docx'), 'Content for article.docx');

    res.status(200).json({ message: `Folder "${folderName}" and files created successfully.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating folder and files.' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
