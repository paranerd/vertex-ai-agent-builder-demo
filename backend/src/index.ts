import express from 'express';
import path from 'path';
import fileUpload from 'express-fileupload';
import { Storage } from '@google-cloud/storage';

const app = express();
const port = process.env.PORT || 8080;

// Enable file uploads
app.use(fileUpload({
  createParentPath: true // Allow creating parent directories if they don't exist
}));

// Initialize Google Cloud Storage
const storage = new Storage();
const bucketName = process.env.BUCKET_NAME || 'default'; // Replace with your bucket name

// Serve static files from the 'public' directory
const publicDirectory = path.join(__dirname, '..', 'public');
app.use(express.static(publicDirectory));

/*app.get('/', (req, res) => {
  res.send('Hello from Express!');
});*/

app.post('/upload-pdf', async (req, res) => {
  try {
    if (!req.files) {
      res.status(400).send('No files were uploaded.');
      return;
    }

    const pdfFile = req.files.pdfFile as fileUpload.UploadedFile; // Assuming the file input name is 'pdfFile'
    // Upload the file to Google Cloud Storage
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(pdfFile.name);
    await file.save(pdfFile.data, {
      metadata: {
        contentType: 'application/pdf'
      }
    });
    res.status(200).send('PDF file uploaded successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error uploading PDF file.');
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
