const ollamaService = require('../services/ollamaService');
const { getItemPrompt } = require('../utils/promptTemplates');

const describeItem = async (req, res, next) => {
    try {
        const { itemName, rarity } = req.body;
        const prompt = getItemPrompt(itemName, rarity);
        
        const rawResponse = await ollamaService.generate(prompt);
        res.json({ success: true, data: { description: rawResponse.trim() } });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    describeItem
};
