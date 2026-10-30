
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3001;

// Enable frontend requests
app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());

// Create uploads folder automatically
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueName =
            Date.now() + "-" +
            Math.round(Math.random() * 1e9) + ext;

        cb(null, uniqueName);
    }
});

// Allow images and PDF files only
const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf"
];

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    },
    fileFilter: (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPG, PNG, WEBP and PDF files are allowed"));
        }
    }
});

// Test API
app.get("/", (req, res) => {
    res.json({
        status: true,
        message: "File upload server is running"
    });
});

// Upload API
app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            status: false,
            message: "Please select a file"
        });
    }

    res.status(200).json({
        status: true,
        message: "File uploaded successfully",
        data: {
            originalName: req.file.originalname,
            filename: req.file.filename,
            size: req.file.size,
            url: `http://localhost:${PORT}/uploads/${req.file.filename}`
        }
    });
});

// Serve uploaded files
app.use("/uploads", express.static(uploadDir));

// Handle upload errors
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            status: false,
            message: err.code === "LIMIT_FILE_SIZE"
                ? "File size must not exceed 5 MB"
                : err.message
        });
    }

    res.status(400).json({
        status: false,
        message: err.message || "Something went wrong"
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
