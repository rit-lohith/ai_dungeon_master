import Phaser from 'phaser';
import { TILE_SIZE } from '../../utils/constants';

export default class NPC extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, key, data) {
        super(scene, x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, key, 0);
        scene.add.existing(this);
        
        this.gridX = x;
        this.gridY = y;
        this.dataStats = data;
        this.hasSpoken = false;

        // Custom Scale for NPCs
        this.setScale(2.5);
        
        // Map all generic NPCs to use the Swordsman2 sprite logic
        const genericNPCs = ['elder_sage', 'blacksmith', 'scared_villager', 'swordsman_lvl2'];
        
        if (genericNPCs.includes(key)) {
            this.setTexture('swordsman_lvl2_idle');
            this.setupSwordsmanAnims(scene);
            this.play('swordsman_lvl2_Front - Idle');
        }
    }

    setupSwordsmanAnims(scene) {
        const createAnim = (animKey, sheet, row, frames, frameRate = 10, repeat = -1) => {
            const fullKey = `swordsman_lvl2_${animKey}`;
            if (!scene.anims.exists(fullKey)) {
                const sheetWidth = scene.textures.get(sheet).source[0].width;
                const framesPerRow = Math.floor(sheetWidth / 64);
                
                scene.anims.create({
                    key: fullKey,
                    frames: scene.anims.generateFrameNumbers(sheet, { 
                        start: row * framesPerRow, 
                        end: row * framesPerRow + (frames - 1) 
                    }),
                    frameRate: frameRate,
                    repeat: repeat
                });
            }
        };

        const directions = { 'Front': 0, 'Left': 1, 'Right': 2, 'Back': 3 };
        const actions = {
            'Idle': { sheet: 'swordsman_lvl2_idle', frames: 12 },
            'Walk': { sheet: 'swordsman_lvl2_walk', frames: 6 },
            'Run': { sheet: 'swordsman_lvl2_run', frames: 8 },
            'Attack': { sheet: 'swordsman_lvl2_attack', frames: 8 },
            'Hurt': { sheet: 'swordsman_lvl2_hurt', frames: 5 },
            'Death': { sheet: 'swordsman_lvl2_death', frames: 7 }
        };

        Object.entries(actions).forEach(([action, info]) => {
            Object.entries(directions).forEach(([dir, row]) => {
                const repeat = (action === 'Attack' || action === 'Death' || action === 'Hurt') ? 0 : -1;
                createAnim(`${dir} - ${action}`, info.sheet, row, info.frames, 10, repeat);
            });
        });
    }

}
