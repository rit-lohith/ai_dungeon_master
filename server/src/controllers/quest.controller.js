const ollamaService = require('../services/ollamaService');
const { getQuestPrompt } = require('../utils/promptTemplates');
const responseFormatter = require('../utils/responseFormatter');

const generateQuest = async (req, res, next) => {
    try {
        const { level } = req.body;
        const prompt = getQuestPrompt(level);
        
        const rawResponse = await ollamaService.generate(prompt);
        const formatted = responseFormatter.parseQuest(rawResponse);
        
        res.json({ success: true, data: formatted });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    generateQuest
};
