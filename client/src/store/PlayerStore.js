import { create } from 'zustand';

const usePlayerStore = create((set, get) => ({
    stats: {
        hp: 100,
        maxHp: 100,
        attack: 10,
        defense: 5,
        level: 1,
        xp: 0,
        gold: 0
    },
    position: { x: 0, y: 0 },
    inventory: [], // max 10
    
    setPosition: (x, y) => set({ position: { x, y } }),
    updateStats: (newStats) => set((state) => {
        const stats = { ...state.stats, ...newStats };
        // Ensure HP is within bounds
        stats.hp = Math.max(0, Math.min(stats.maxHp, stats.hp));
        return { stats };
    }),
    
    gainXp: (amount) => {
        const { stats } = get();
        let newXp = stats.xp + amount;
        let newLevel = stats.level;
        let pStats = { ...stats };
        
        while (newXp >= newLevel * 50) {
            newXp -= newLevel * 50;
            newLevel++;
            pStats.maxHp += 20;
            pStats.hp = pStats.maxHp;
            pStats.attack += 3;
            pStats.defense += 1;
            console.log(`Congratulations! Reached Level ${newLevel}. Your stats increased!`);
        }
        
        set({ stats: { ...pStats, xp: newXp, level: newLevel } });
    },
    
    addItem: (item) => set((state) => {
        if (!item || !item.id) {
            console.error("Attempted to add invalid item to inventory:", item);
            return state;
        }
        if (state.inventory.length >= 10) return state;
        return { inventory: [...state.inventory, item] };
    }),


    removeItem: (index) => set((state) => {
        const inv = [...state.inventory];
        inv.splice(index, 1);
        return { inventory: inv };
    }),

    resetPlayer: () => set({
        stats: {
            hp: 100,
            maxHp: 100,
            attack: 10,
            defense: 5,
            level: 1,
            xp: 0,
            gold: 0
        },
        position: { x: 0, y: 0 },
        inventory: []
    })
}));

export default usePlayerStore;
