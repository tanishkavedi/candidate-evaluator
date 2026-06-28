const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

router.post("/", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(req.file.buffer, {
      max: 0
    });
    
    const text = data.text.trim();

    if (!text || text.length < 50) {
      return res.status(400).json({ error: "Could not extract text from PDF" });
    }

    res.json({ text });
  } catch (error) {
    console.error("PDF parse error:", error.message);
    res.status(500).json({ error: "Failed to read PDF file: " + error.message });
  }
});

module.exports = router;