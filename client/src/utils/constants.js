export const TILE_SIZE = 32;
export const MAP_WIDTH = 80;
export const MAP_HEIGHT = 80;

export const SCENES = {
    BOOT: 'BootScene',
    MENU: 'MenuScene',
    GAME: 'GameScene',
    COMBAT: 'CombatScene',
    DIALOGUE: 'DialogueScene',
    GAMEOVER: 'GameOverScene'
};

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
