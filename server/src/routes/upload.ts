import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { FixedFieldsPDFParser } from '../services/fixedFieldsPdfParser';

const router = express.Router();
const pdfParser = new FixedFieldsPDFParser();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `salary-${uniqueSuffix}.pdf`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Upload and parse PDF endpoint
router.post('/pdf', upload.single('pdfFile'), async (req, res) => {
  console.log('PDF upload request received');
  console.log('File info:', req.file ? { name: req.file.filename, size: req.file.size } : 'No file');
  
  try {
    if (!req.file) {
      console.log('Error: No file uploaded');
      return res.status(400).json({
        success: false,
        error: 'No PDF file uploaded'
      });
    }

    const filePath = req.file.path;
    console.log('Processing file at:', filePath);
    
    // Parse the PDF
    const result = await pdfParser.processMultipleEmployees(filePath);
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    // Return parsed data with summary
    res.json({
      success: true,
      data: result.data,
      warning: result.warning,
      summary: {
        totalEmployees: result.data?.totalEmployees || 0,
        month: result.data?.month,
        year: result.data?.year,
        department: result.data?.department,
        processingDate: result.data?.processingDate
      }
    });

  } catch (error) {
    // Clean up file if it exists
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Error processing PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while processing PDF'
    });
  }
});

// Parse specific PDF file endpoint (for testing with existing file)
router.post('/parse-file', async (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'File path is required'
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    const result = await pdfParser.processMultipleEmployees(filePath);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      data: result.data,
      warning: result.warning,
      summary: {
        totalEmployees: result.data?.totalEmployees || 0,
        month: result.data?.month,
        year: result.data?.year,
        department: result.data?.department,
        processingDate: result.data?.processingDate
      }
    });

  } catch (error) {
    console.error('Error parsing PDF file:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while parsing PDF file'
    });
  }
});

export default router;