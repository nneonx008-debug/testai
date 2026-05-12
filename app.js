import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import axios from "axios";

dotenv.config();
const PORT = process.env.PORT || 3000
const app = express();

app.use(cors());
app.use(express.json());

// SERVE FRONTEND
app.get("/", (req, res) => {
  res.sendFile(path.resolve("index.html"));
});

// AI CHAT ROUTE
app.post("/chat", async (req, res) => {

  const message = req.body.message;

  try {

    const messages = [
      {
        role: "system",
        content: `
You are a bilingual AI translator and assistant.

Rules:
- Detect the language of the user input.
- If the input is English → translate to Twi (Akan Ghana dialect).
- If the input is Twi → translate to English.
- If the input is mixed → translate both clearly.
- Do NOT explain.
- Only return the translation.
- Be natural and accurate.
`
      },
      {
        role: "user",
        content: message
      }
    ];

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const aiReply =
      response.data.choices[0].message.content;

    res.json({ reply: aiReply });

  } catch (error) {

    console.log(error.response?.data || error.message);

    res.json({
      reply: "Translation error occurred."
    });
  }
});

// START SERVER
app.listen(PORT, () => {
  console.log("Server running on http://localhost:3000");
});