const parseNPCDialogue = (rawText) => {
    try {
        if (rawText.trim().startsWith('{') && rawText.trim().endsWith('}')) {
            return JSON.parse(rawText.trim());
        }
    } catch {
        // Fallback to text
    }
    return { text: rawText.trim() };
};

const parseQuest = (rawText) => {
    try {
        const jsonMatch = rawText.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('No JSON found in quest response');
    } catch {
        return {
            type: "kill",
            title: "Clear out the monsters",
            objective: "Defeat enemies in the dungeon.",
            target: "enemy",
            reward: { gold: 10, xp: 50 }
        };
    }
};

module.exports = {
    parseNPCDialogue,
    parseQuest
};
