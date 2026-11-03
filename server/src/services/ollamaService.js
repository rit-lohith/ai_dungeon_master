const axios = require('axios');

class OllamaService {
    constructor() {
        this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        this.model = process.env.OLLAMA_MODEL || 'phi3';
    }

    async generate(prompt) {
        try {
            console.log(`DEBUG: Sending request to Ollama: ${this.baseUrl}/api/generate (model: ${this.model})`);
            const response = await axios.post(`${this.baseUrl}/api/generate`, {
                model: this.model,
                prompt: prompt,
                stream: false
            });
            console.log('DEBUG: Received response from Ollama');
            return response.data.response;
        } catch (error) {
            console.log('DEBUG: Ollama unavailable or failed, using mock response.');
            // Automatically fallback to a mock response so the game still works without Ollama installed
            return "The spirits seem quiet today... (Mock response: Ollama is currently disconnected or unavailable)";
        }
    }
}

module.exports = new OllamaService();
