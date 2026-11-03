import { create } from 'zustand';
import { SCENES } from '../utils/constants';

const useGameStore = create((set) => ({
    currentScene: SCENES.BOOT,
    isPaused: false,
    dungeonLevel: 1,
    dungeonSeed: null,
    mapGrid: null,
    activeNPC: null,
    enemyPositions: [],
    itemPositions: [],
    npcPositions: [],
    isBossDefeated: false,
    isMinimapMaximized: false,
    isInventoryOpen: false,
    
    setScene: (scene) => set({ currentScene: scene }),
    setActiveNPC: (npc) => set({ activeNPC: npc }),
    togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
    toggleInventory: () => set((state) => ({ isInventoryOpen: !state.isInventoryOpen })),
    setDungeonLevel: (level) => set({ dungeonLevel: level, isBossDefeated: false }), // Reset boss flag on new level
    setDungeonSeed: (seed) => set({ dungeonSeed: seed }),
    setMapGrid: (grid) => set({ mapGrid: grid }),
    setEnemyPositions: (positions) => set({ enemyPositions: positions }),
    setItemPositions: (positions) => set({ itemPositions: positions }),
    setNpcPositions: (positions) => set({ npcPositions: positions }),
    setBossDefeated: (isDefeated) => set({ isBossDefeated: isDefeated }),
    toggleMinimap: () => set((state) => ({ isMinimapMaximized: !state.isMinimapMaximized })),
    
    resetGame: () => set({
        isPaused: false,
        dungeonLevel: 1,
        dungeonSeed: null,
        mapGrid: null,
        activeNPC: null,
        enemyPositions: [],
        itemPositions: [],
        npcPositions: [],
        isBossDefeated: false,
        isMinimapMaximized: false
    })
}));



export default useGameStore;
