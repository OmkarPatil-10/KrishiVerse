const axios = require("axios");
require("dotenv").config();

const getChatResponse = async (req, res) => {
    try {
        const { message } = req.body;

        const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "OpenRouter API key is missing. Please add OPENROUTER_API_KEY to your .env file."
            });
        }

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const API_URL = "https://openrouter.ai/api/v1/chat/completions";

        const instruction = `
You are a specialized farming and agricultural assistant for Krishiverse.

Rules:
- Answer only farming and agriculture related questions.
- Topics allowed: crops, soil, irrigation, fertilizers, pests, livestock, weather for farming, agricultural tools, farming techniques, and government farming schemes.
- If the question is not related to farming or agriculture, politely say:
  "I can only help with farming and agriculture related questions."
- Keep answers concise, practical, and helpful.
`;

        const response = await axios.post(
            API_URL,
            {
                model: "openrouter/free",
                messages: [
                    {
                        role: "user",
                        content: `${instruction}\n\nUser question: ${message}`
                    }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "Krishiverse"
                }
            }
        );

        if (
            response.data &&
            response.data.choices &&
            response.data.choices[0] &&
            response.data.choices[0].message
        ) {
            const responseText = response.data.choices[0].message.content;
            return res.status(200).json({ response: responseText });
        } else {
            console.error("OpenRouter invalid response:", response.data);
            return res.status(500).json({
                error: "Invalid response format from OpenRouter API"
            });
        }
    } catch (error) {
        console.error("Error in OpenRouter API:", error.response?.data || error.message);

        const errorMessage =
            error.response?.data?.error?.message ||
            error.message ||
            "Failed to get response from AI assistant";

        return res.status(500).json({ error: errorMessage });
    }
};

module.exports = { getChatResponse };