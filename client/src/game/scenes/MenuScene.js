import Phaser from 'phaser';
import { SCENES } from '../../utils/constants';
import useGameStore from '../../store/GameStore';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super(SCENES.MENU);
    }
    
    create() {
        // UI is handled by React Overlay.
        // We just stay in this scene until GameStore signals to start
        
        const unsubscribe = useGameStore.subscribe((state, prevState) => {
            if(state.currentScene === SCENES.GAME && prevState.currentScene !== SCENES.GAME) {
                // Decouple from React sync event loop to prevent 'queueOp' null pointer crash
                setTimeout(() => {
                    if (this.scene && typeof this.scene.start === 'function') {
                        unsubscribe();
                        this.scene.start(SCENES.GAME);
                    }
                }, 0);
            }
        });

        // BGM Logic: Fade In and Loop
        if (this.cache.audio.exists('game_bgm') && !this.sound.get('game_bgm')) {
            const bgm = this.sound.add('game_bgm', { loop: true, volume: 0 });
            
            const startBGM = () => {
                if (!bgm.isPlaying) {
                    bgm.play();
                    this.tweens.add({
                        targets: bgm,
                        volume: 0.8,
                        duration: 2500,
                        ease: 'Linear'
                    });
                }
            };

            // Try to play immediately
            startBGM();

            // Fallback for browser interaction policy
            this.input.once('pointerdown', startBGM);
        }

        // Cleanup on shutdown
        this.events.once('shutdown', () => {
            unsubscribe();
        });
    }
}
