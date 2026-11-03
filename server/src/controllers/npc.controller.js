const ollamaService = require('../services/ollamaService');
const { getNPCPrompt } = require('../utils/promptTemplates');
const responseFormatter = require('../utils/responseFormatter');
const cacheService = require('../services/cacheService');

const generateDialogue = async (req, res, next) => {
    try {
        const { characterId, playerInput, context } = req.body;
        console.log('DEBUG: Received dialogue request:', { characterId, playerInput, context });
        
        // Cache disabled for debugging
        const inputKey = (playerInput || 'greet').trim().toLowerCase();
        const cacheKey = `dialogue_${characterId}_${inputKey}`;
        // const cachedResponse = cacheService.get(cacheKey);
        // if (cachedResponse) {
        //     console.log('DEBUG: Cache hit for', cacheKey);
        //     return res.json({ success: true, data: cachedResponse });
        // }

        let prompt;
        const { getNPCPrompt, getEnemyPrompt } = require('../utils/promptTemplates');
        
        // Null-safe handling for context
        if (context && context.dialogueType === 'enemy') {
            prompt = getEnemyPrompt(context);
        } else {
            prompt = getNPCPrompt(context || {}, playerInput);
        }

        console.log('DEBUG: Generated prompt:', prompt);
        const rawResponse = await ollamaService.generate(prompt);
        console.log('DEBUG: Raw Ollama response:', rawResponse);
        
        // Parse dialogue format (can return JSON object or text string wrapper)
        const responseData = responseFormatter.parseNPCDialogue(rawResponse);
        
        // cacheService.set(cacheKey, responseData);
        res.json({ success: true, data: responseData });
    } catch (error) {
        console.error('DEBUG: Dialogue error:', error);
        next(error);
    }
};

module.exports = {
    generateDialogue
};
