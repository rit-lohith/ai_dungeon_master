import { create } from 'zustand';

const useQuestStore = create((set) => ({
    quests: [], // active, completed, failed
    
    addQuest: (quest) => set((state) => ({ 
        quests: [...state.quests, { ...quest, status: 'active', progress: 0 }] 
    })),
    
    updateQuestProgress: (id, amount) => set((state) => {
        const qs = state.quests.map(q => {
            if (q.id === id && q.status === 'active') {
                const prog = q.progress + amount;
                if (prog >= q.amount) return { ...q, progress: prog, status: 'completed' };
                return { ...q, progress: prog };
            }
            return q;
        });
        return { quests: qs };
    })
}));

export default useQuestStore;
