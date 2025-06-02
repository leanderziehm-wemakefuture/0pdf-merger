const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.CODEKIT_API_KEY;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Upload endpoint for single or multiple PDFs
app.post('/api/upload', upload.array('pdfs', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files.map((file, index) => ({
      id: `file_${Date.now()}_${index}`,
      name: file.originalname,
      buffer: file.buffer.toString('base64'),
      size: file.size
    }));

    res.json({ files });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Merge PDFs endpoint
app.post('/api/merge', async (req, res) => {
  try {
    const { files, fileName } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided for merging' });
    }

    if (!API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Prepare files for the API
    const pdfFiles = files.map((file) => ({
      buffer: file.buffer,
      fileName: file.name,
      pages: file.pages || undefined
    }));

    // Call the PDF merge API
    const response = await axios.post('https://prod.0codekit.com/pdf/merge', {
      files: pdfFiles,
      getAsUrl: true,
      fileName: fileName || `merged_${Date.now()}.pdf`
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'auth': API_KEY
      }
    });

    if (response.status === 200 && response.data.url) {
      res.json({
        success: true,
        url: response.data.url,
        fileName: fileName || `merged_${Date.now()}.pdf`
      });
    } else {
      throw new Error('API response was not successful');
    }
  } catch (error) {
    console.error('Merge error:', error);
        
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.data?.errorMessage || 'Merge failed'
      });
    } else {
      res.status(500).json({ error: 'Internal server error during merge' });
    }
  }
});

// Progress endpoint (simulated for demo)
app.get('/api/progress/:jobId', (req, res) => {
  // In a real implementation, you'd track actual progress
  // For now, we'll simulate progress
  const progress = Math.min(100, Math.random() * 100);
  res.json({ progress: Math.round(progress) });
});

// Serve index.html at root path
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`PDF Merger server running on port ${PORT}`);
  console.log(`API Key configured: ${!!API_KEY}`);
});

module.exports = app;