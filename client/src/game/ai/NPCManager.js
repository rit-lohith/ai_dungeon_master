import useNPCStore from '../../store/NPCStore';

class NPCManager {
    static getMemory(npcId) {
        return useNPCStore.getState().memories[npcId] || { history: [], emotion: 'neutral' };
    }

    static addMemory(npcId, message, role) {
        useNPCStore.getState().addMemory(npcId, message, role);
    }

    static updateEmotionBasedOnEvent(npcId, event) {
        // e.g. player attacked nearby
        if (event === 'violence_near') {
            useNPCStore.getState().setEmotion(npcId, 'fearful');
        } else if (event === 'given_gift') {
            useNPCStore.getState().setEmotion(npcId, 'friendly');
        }
    }
}

export default NPCManager;
