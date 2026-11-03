import usePlayerStore from '../store/PlayerStore';
import useQuestStore from '../store/QuestStore';
import useNPCStore from '../store/NPCStore';
import useGameStore from '../store/GameStore';

export default class SaveManager {
    static saveGame() {
        const payload = {
            player: usePlayerStore.getState(),
            quests: useQuestStore.getState(),
            npcs: useNPCStore.getState(),
            game: useGameStore.getState()
        };
        
        try {
            localStorage.setItem('aidungeon_save', JSON.stringify(payload));
            console.log("Game Saved Successfully");
        } catch(e) {
            console.error("Failed to save game", e);
        }
    }

    static loadGame() {
        try {
            const dataStr = localStorage.getItem('aidungeon_save');
            if (dataStr) {
                const data = JSON.parse(dataStr);
                usePlayerStore.setState(data.player);
                useQuestStore.setState(data.quests);
                useNPCStore.setState(data.npcs);
                useGameStore.setState(data.game);
                return true;
            }
        } catch(e) {
            console.error("Failed to load game", e);
        }
        return false;
    }
}
