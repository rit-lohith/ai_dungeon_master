import { create } from 'zustand';

const useNPCStore = create((set) => ({
    memories: {}, // { npcId: { history: [], emotion: 'neutral' } }
    
    addMemory: (npcId, message, role) => set((state) => {
        const npcData = state.memories[npcId] || { history: [], emotion: 'neutral' };
        let hist = [...npcData.history, { role, content: message }];
        if (hist.length > 10) hist.shift(); // keep max 10
        
        return {
            memories: {
                ...state.memories,
                [npcId]: { ...npcData, history: hist }
            }
        };
    }),
    
    setEmotion: (npcId, emotion) => set((state) => {
        const npcData = state.memories[npcId] || { history: [], emotion: 'neutral' };
        return {
            memories: {
                ...state.memories,
                [npcId]: { ...npcData, emotion }
            }
        };
    })
}));

export default useNPCStore;
