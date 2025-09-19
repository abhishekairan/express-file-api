import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import process from "process";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Configure dotenv
dotenv.config();

// ES6 equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();


app.use(
  cors({
    origin: true, // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allowedHeaders: [
      "Content-Type", 
      "Authorization", 
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers"
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    preflightContinue: false
  })
);

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

const UPLOAD_DIR = path.join(__dirname, 'uploads'); // Change as needed

// Extending file upload limit from 1MB to 100MB
app.use(express.json({ limit: 100 * 1024 * 1024 }));
app.use(express.urlencoded({ limit: 100 * 1024 * 1024, extended: true }));

// Setup multer disk storage: creates upload directory if missing
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Save as timestamp-originalname for uniqueness
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage,limits: { fileSize: 100 * 1024 * 1024 } });

// Log all incoming requests
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Async error handling wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// File validation helper
const validateFile = (file) => {
  if (!file) {
    throw new Error('No file uploaded');
  }
  
  // Check file size (100MB limit)
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds 100MB limit');
  }
  
  // Check file type (optional - you can customize this)
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'application/json',
    'application/zip', 'application/x-zip-compressed'
  ];
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
    throw new Error(`File type ${file.mimetype} not allowed`);
  }
  
  return true;
};

// Route: Upload a single file
app.post("/api/upload", upload.single("file"), asyncHandler(async (req, res) => {
  try {
    // Validate the uploaded file
    validateFile(req.file);
    
    // Return file access URL (absolute path, adjust hostname for real deploy)
    const baseUrl = process.env.SITE || `http://localhost:${process.env.PORT || 5500}`;
    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: `${baseUrl}/api/files/${encodeURIComponent(req.file.filename)}`,
    });
  } catch (error) {
    throw error; // Let the error handler catch it
  }
}));

// Route: Fetch/Get a file by filename
app.get("/api/files/:filename", asyncHandler(async (req, res) => {
  try {
    const filename = path.basename(req.params.filename); // Prevent traversal
    
    // Additional security check for filename
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid filename" 
      });
    }
    
    const filePath = path.join(UPLOAD_DIR, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false,
        error: "File not found" 
      });
    }
    
    // Check if it's actually a file (not a directory)
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid file" 
      });
    }
    
    res.sendFile(filePath);
  } catch (error) {
    throw error; // Let the error handler catch it
  }
}));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  // Multer errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: "File too large",
      message: "File size exceeds the 100MB limit"
    });
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: "Unexpected field",
      message: "Unexpected file field in request"
    });
  }
  
  // CORS errors
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: "CORS Error",
      message: "Origin not allowed by CORS policy"
    });
  }
  
  // File validation errors
  if (error.message.includes('No file uploaded') || 
      error.message.includes('File size exceeds') ||
      error.message.includes('not allowed')) {
    return res.status(400).json({
      success: false,
      error: "File validation error",
      message: error.message
    });
  }
  
  // File system errors
  if (error.code === 'ENOENT') {
    return res.status(404).json({
      success: false,
      error: "File not found",
      message: "The requested file does not exist"
    });
  }
  
  if (error.code === 'EACCES') {
    return res.status(403).json({
      success: false,
      error: "Permission denied",
      message: "Insufficient permissions to access the file"
    });
  }
  
  // Default error response
  res.status(error.status || 500).json({
    success: false,
    error: "Internal server error",
    message: process.env.NODE_ENV === 'production' 
      ? "Something went wrong" 
      : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`File API running at http://localhost:${PORT}/`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
});
