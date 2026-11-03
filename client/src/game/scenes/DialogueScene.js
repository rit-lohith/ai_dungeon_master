import Phaser from 'phaser';
import { SCENES } from '../../utils/constants';
import useGameStore from '../../store/GameStore';

export default class DialogueScene extends Phaser.Scene {
    constructor() {
        super(SCENES.DIALOGUE);
    }
    
    create(data) {
        // Disable Phaser's keyboard capture to allow typing in HTML/React input boxes
        if (this.input.keyboard) {
            this.input.keyboard.enabled = false;
        }
        
        this.events.on('shutdown', () => {
            if (this.input.keyboard) {
                this.input.keyboard.enabled = true;
            }
        });
    }

    update() {
        const { currentScene } = useGameStore.getState();
        if (currentScene !== SCENES.DIALOGUE) {
            this.scene.stop();
        }

    }
}
