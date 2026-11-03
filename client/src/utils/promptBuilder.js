// Wrapper to build payloads for backend proxy

export const buildDialogPayload = (npcId, input, context) => ({
    characterId: npcId,
    playerInput: input,
    context
});

export const buildQuestPayload = (level) => ({
    level
});

export const buildItemPayload = (itemName, rarity) => ({
    itemName,
    rarity
});
