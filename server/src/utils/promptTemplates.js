const getNPCPrompt = (context, playerInput) => {
    return `You are ${context.name}, a ${context.occupation} in a fantasy dungeon.
Personality: ${context.personality}
Emotion: ${context.emotion}
History: ${context.history || 'none'}
Player said: ${playerInput}

Respond in 2-3 sentences.
If giving quest, return ONLY JSON:
{"type":"quest","title":"...","objective":"...","target":"...","reward":{"gold":0,"xp":0,"item":"..."}}
Otherwise, answer normally.`;
};

const getQuestPrompt = (level) => {
    return `Generate a dungeon quest for level ${level}.
Return ONLY JSON:
{"type":"...","title":"...","objective":"...","target":"...","reward":{"gold":0,"xp":0,"item":"..."}}`;
};

const getItemPrompt = (itemName, rarity) => {
    return `Give 1-line fantasy description for ${itemName}, rarity ${rarity}`;
};

const getEnemyPrompt = (context) => {
    return `You are a hostile enemy named ${context.name}.
Type: ${context.id}
Personality: ${context.personality || 'aggressive'}
Player is nearby.
Say a short threatening or contextual line (1-2 sentences).`;
};

module.exports = {
    getNPCPrompt,
    getQuestPrompt,
    getItemPrompt,
    getEnemyPrompt
};
