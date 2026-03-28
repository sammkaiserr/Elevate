import express from "express";
import multer from "multer";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import { analyzeResume } from "./analyzeResume.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDF files are accepted" });
    }

    // Extract text from PDF
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "Could not extract text from PDF" });
    }

    // Analyze resume with Groq Llama/Gemini
    const analysis = await analyzeResume(resumeText);

    return res.json({
      success: true,
      resumeText,
      analysis,
    });
  } catch (error) {
    console.error("Error processing resume:", error);
    return res.status(500).json({
      error: error.message || "Failed to process resume",
    });
  }
});

export default router;
