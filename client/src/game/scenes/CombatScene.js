import Phaser from 'phaser';
import { SCENES } from '../../utils/constants';

export default class CombatScene extends Phaser.Scene {
    constructor() {
        super(SCENES.COMBAT);
    }
    
    create(data) {
        // Pauses the game scene beneath it
        this.scene.pause(SCENES.GAME);
        
        // Let the React overlay handle the actual combat UI
        // We'll listen for events to resume
        
        this.events.on('combat_over', () => {
            this.scene.resume(SCENES.GAME);
            this.scene.stop();
        });
    }
}
