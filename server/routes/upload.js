const express = require("express");
const router = express.Router();
const multer = require("multer");
const PDFParser = require("pdf2json");

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
    const text = await new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();

      pdfParser.on("pdfParser_dataError", (err) => {
        reject(err.parserError);
      });

      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        const text = pdfParser.getRawTextContent();
        resolve(text);
      });

      pdfParser.parseBuffer(req.file.buffer);
    });

    if (!text || text.trim().length < 50) {
      return res.status(400).json({ error: "Could not extract text from PDF" });
    }

    res.json({ text: text.trim() });
  } catch (error) {
    console.error("PDF parse error:", error.message);
    res.status(500).json({ error: "Failed to read PDF file: " + error.message });
  }
});

module.exports = router;