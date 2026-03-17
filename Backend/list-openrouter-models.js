const axios = require("axios");
require("dotenv").config();

async function listOpenRouterModels() {
    try {
        const response = await axios.get("https://openrouter.ai/api/v1/models");
        const freeModels = response.data.data.filter(m => m.id.endsWith(":free"));
        console.log("Free Models on OpenRouter:");
        freeModels.forEach(m => console.log(m.id));
    } catch (e) {
        console.error("Failed to list models:", e.message);
    }
}

listOpenRouterModels();
