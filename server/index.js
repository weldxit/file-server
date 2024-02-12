const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const pool = require('./pool')

const app = express();
const port = 3000; // Change as needed

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Endpoint to handle POST requests
app.post('/saveText', async (req, res) => {
  try {
    const { text, creationTimestamp } = req.body;

    if (!text || !creationTimestamp) {
      return res.status(400).json({ error: 'Invalid request. Missing required data.' });
    }

    // Insert data into the database
    const insertQuery = 'INSERT INTO latepost (title, timestamp) VALUES ($1, $2)';
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

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
