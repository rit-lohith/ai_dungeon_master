import Phaser from 'phaser';
import { TILE_SIZE } from '../../utils/constants';

export default class Item extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, key, data) {
        super(scene, x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, key);
        scene.add.existing(this);
        
        this.gridX = x;
        this.gridY = y;
        this.itemData = data;

        // Scale down to fit character/tile size
        this.setDisplaySize(32, 32);


        
        // Hover float animation
        this.scene.tweens.add({
            targets: this,
            y: this.y - 5,
            yoyo: true,
            repeat: -1,
            duration: 1000,
            ease: 'Sine.easeInOut'
        });
    }
}
