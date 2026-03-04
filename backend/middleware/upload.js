import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage for notifications
const notificationStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `notification-${uniqueSuffix}${ext}`);
  }
});

// Configure storage for MCQ images
const mcqImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `mcq-${uniqueSuffix}${ext}`);
  }
});

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
  }
};

export const upload = multer({
  storage: notificationStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

export const uploadMcqImage = multer({
  storage: mcqImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// CSV file upload storage (in memory for parsing)
const csvStorage = multer.memoryStorage();

// CSV file filter
const csvFileFilter = (req, file, cb) => {
  const allowedTypes = /csv|text\/csv|text\/plain/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/vnd.ms-excel';

  if (mimetype || extname || file.originalname.toLowerCase().endsWith('.csv')) {
    return cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'));
  }
};

export const uploadCSV = multer({
  storage: csvStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for CSV
  },
  fileFilter: csvFileFilter
});

// PDF file upload storage
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../data/files'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `material-${uniqueSuffix}${ext}`);
  }
});

// PDF file filter
const pdfFileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|application\/pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype || extname || file.originalname.toLowerCase().endsWith('.pdf')) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

export const uploadPDF = multer({
  storage: pdfStorage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit for PDF
  },
  fileFilter: pdfFileFilter
});

