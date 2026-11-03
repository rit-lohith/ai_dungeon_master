import Phaser from 'phaser';
import { SCENES } from '../../utils/constants';
import useGameStore from '../../store/GameStore';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super(SCENES.GAMEOVER);
    }
    
    create() {
        this.scene.stop(SCENES.GAME);
        
        // Listen for scene changes from React UI
        const unsubscribe = useGameStore.subscribe((state, prevState) => {
            if (state.currentScene === SCENES.GAME && prevState.currentScene !== SCENES.GAME) {
                setTimeout(() => {
                    if (this.scene && typeof this.scene.start === 'function') {
                        unsubscribe();
                        this.scene.start(SCENES.GAME);
                    }
                }, 0);
            }
            if (state.currentScene === SCENES.MENU && prevState.currentScene !== SCENES.MENU) {
                setTimeout(() => {
                    if (this.scene && typeof this.scene.start === 'function') {
                        unsubscribe();
                        this.scene.start(SCENES.MENU);
                    }
                }, 0);
            }
        });

        // BGM Fade Out
        const bgm = this.sound.get('game_bgm');
        if (bgm) {
            this.tweens.add({
                targets: bgm,
                volume: 0,
                duration: 2000,
                onComplete: () => {
                    if (bgm.isPlaying) bgm.stop();
                }
            });
        }

        // Cleanup on shutdown
        this.events.once('shutdown', () => {
            unsubscribe();
        });
    }
}
