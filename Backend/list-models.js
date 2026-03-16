const axios = require("axios");
require("dotenv").config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    try {
        const response = await axios.get(API_URL);
        console.log("Available Models:");
        response.data.models.forEach(m => console.log(m.name));
    } catch (e) {
        console.error("Listing failed:", e.response?.data || e.message);
    }
}

listModels();
