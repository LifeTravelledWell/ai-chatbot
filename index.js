const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Setup OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Multer storage (for PDF uploads)
const upload = multer({ storage: multer.memoryStorage() });

// Store extracted text (temporary for now)
let extractedText = "";

// Upload PDF and extract text
app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded.");

    const pdfBuffer = req.file.buffer;
    const pdfData = await pdfParse(pdfBuffer);
    extractedText = pdfData.text;

    res.json({ success: true, message: "PDF uploaded & text extracted!", extractedText });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Ask AI a question
app.post("/ask", express.json(), async (req, res) => {
  try {
    const { question } = req.body;

    if (!extractedText) return res.status(400).send("No document uploaded yet.");

    // Send question and document text to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful AI that answers questions about a document." },
        { role: "user", content: `Here is the document text:\n${extractedText}\n\nQuestion: ${question}` },
      ],
    });

    const aiResponse = response.choices[0].message.content;

    res.json({ success: true, answer: aiResponse });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
