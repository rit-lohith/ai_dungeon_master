import SaveManager from '../services/SaveManager';

export function useSave() {
    return {
        save: SaveManager.saveGame,
        load: SaveManager.loadGame
    };
}
