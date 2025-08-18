const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const process = require("process");
const cors = require("cors");
const morgan = require("morgan");

app.use(
  cors({
    origin: ["*"],
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);

const app = express();
const UPLOAD_DIR = `${process.cwd()}/uploads`; // Change as needed

// Extending file upload limit from 1MB to 100MB
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

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
const upload = multer({ storage });

// Log all incoming requests
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

// Route: Upload a single file
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  // Return file access URL (absolute path, adjust hostname for real deploy)
  res.json({
    success: true,
    filename: req.file.filename,
    url: `/api/files/${encodeURIComponent(req.file.filename)}`,
  });
});

// Route: Fetch/Get a file by filename
app.get("/api/files/:filename", (req, res) => {
  const filename = path.basename(req.params.filename); // Prevent traversal
  const filePath = path.join(UPLOAD_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }
  res.sendFile(filePath);
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`File API running at http://localhost:${PORT}/`);
});
