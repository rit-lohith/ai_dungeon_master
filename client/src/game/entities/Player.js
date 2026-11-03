import Phaser from 'phaser';
import { TILE_SIZE } from '../../utils/constants';
import usePlayerStore from '../../store/PlayerStore';
import HealthBar from '../components/HealthBar';

// import heroAnimations from '../data/heroAnimations.json'; // No longer needed


export default class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        // Start with the Front - Idle_0 texture
        // Start with the Idle frame
        super(scene, x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 'hero_idle', 0);
        scene.add.existing(this);
        
        // Scale increased to 2.5 for maximum visibility as requested.
        this.setScale(2.5);


        
        this.gridX = x;
        this.gridY = y;
        this.isMoving = false;
        this.lastDir = 'Front';

        // Active/Recovery timers (in ms)
        this.lastAttackTime = 0;
        this.attackCooldown = 600; 
        this.lastMoveTime = 0;
        this.moveCooldown = 140; // Reduced for snapier feel
        this.attackBuffered = false;

        this.hp = usePlayerStore.getState().stats.hp;

        this.maxHp = usePlayerStore.getState().stats.maxHp;
        this.healthBar = new HealthBar(scene, this.x, this.y - 40, 40, 6);


        // Create Animations from Spritesheets
        const createAnim = (key, sheet, row, frames, frameRate = 10, repeat = -1) => {
            if (!scene.anims.exists(key)) {
                // Each row has a set of frames. Assuming 4 rows for directions.
                // Row 0: Side (Right), Row 1: Front, Row 2: Back, Row 3: ??
                // Let's deduce from TMX or common patterns.
                // We'll use: 0: Right, 1: Front, 2: Back. Left will be flipped Right.
                let startFrame = row * (scene.textures.get(sheet).getFrameNames().length / 4);
                // Wait, simpler way:
                const sheetWidth = scene.textures.get(sheet).source[0].width;
                const framesPerRow = Math.floor(sheetWidth / 64);
                
                scene.anims.create({
                    key: key,
                    frames: scene.anims.generateFrameNumbers(sheet, { 
                        start: row * framesPerRow, 
                        end: row * framesPerRow + (frames - 1) 
                    }),
                    frameRate: frameRate,
                    repeat: repeat
                });
            }
        };

        // Mapping rows to directions: 0 = Front, 1 = Left, 2 = Right, 3 = Back
        const directions = { 'Front': 0, 'Left': 1, 'Right': 2, 'Back': 3 };



        ['Idle', 'Walk', 'Run', 'Attack', 'Hurt', 'Death', 'Death_red'].forEach(action => {
            const sheet = action === 'Death_red' ? 'hero_death_red' : `hero_${action.toLowerCase()}`;
            // Corrected frame counts based on sheet widths:
            // Idle: 12, Walk: 6, Run: 8, Attack: 8, Hurt: 5, Death: 7, Death_red: 7
            const counts = { 'Idle': 12, 'Walk': 6, 'Run': 8, 'Attack': 8, 'Hurt': 5, 'Death': 7, 'Death_red': 7 };
            const frameCount = counts[action];
            
            Object.entries(directions).forEach(([dir, row]) => {
                createAnim(`${dir} - ${action}`, sheet, row, frameCount, 10, (action === 'Attack' || action.includes('Death') || action === 'Hurt') ? 0 : -1);
            });
        });


        
        // Play idle animation by default
        this.play('Front - Idle');
    }

    move(dx, dy, map, onMove) {
        if (this.isMoving) return;
        
        // Determine direction
        let animDir = this.lastDir;
        if (dx > 0) animDir = 'Right';
        else if (dx < 0) animDir = 'Left';
        else if (dy < 0) animDir = 'Back';
        else if (dy > 0) animDir = 'Front';
        
        this.lastDir = animDir;
        
        const nextX = this.gridX + dx;
        const nextY = this.gridY + dy;
        
        if (map.isWalkable(nextX, nextY)) {
            this.isMoving = true;
            this.gridX = nextX;
            this.gridY = nextY;
            
            this.play(`${animDir} - Walk`, true);
            
            this.scene.tweens.add({
                targets: this,
                x: this.gridX * TILE_SIZE + TILE_SIZE / 2,
                y: this.gridY * TILE_SIZE + TILE_SIZE / 2,
                duration: 150,
                onUpdate: () => {
                    this.healthBar.updatePosition(this.x, this.y - 40);
                },

                onComplete: () => {
                    this.isMoving = false;
                    this.play(`${this.lastDir} - Idle`, true);
                    if (onMove) onMove();
                }
            });



        } else {
            this.moveBump(dx, dy, animDir);
        }
    }

    moveBump(dx, dy, animDir) {
        if (this.isMoving) return;
        this.isMoving = true;
        this.play(`${animDir} - Walk`, true);


        this.scene.tweens.add({
            targets: this,
            x: this.x + dx * 10,
            y: this.y + dy * 10,
            yoyo: true,
            duration: 100,
            onComplete: () => {
                this.isMoving = false;
                this.play(`${animDir} - Idle`, true);
            }
        });
    }

    attack(dx, dy, onHit, onComplete) {
        if (this.isMoving) return;
        this.isMoving = true;
        
        let animDir = this.lastDir;
        if (dx > 0) animDir = 'Right';
        else if (dx < 0) animDir = 'Left';
        else if (dy < 0) animDir = 'Back';
        else if (dy > 0) animDir = 'Front';
        
        this.lastDir = animDir;
        
        const animName = `${animDir} - Attack`;
        if (this.scene.anims.exists(animName)) {
            this.play(animName, true);
        } else {
            this.play(`${animDir} - Idle`, true); // fallback
        }

        // Trigger onHit at the peak of the sword swing (Frame 4-5)
        if (this.scene && this.scene.time) {
            this.scene.time.delayedCall(450, () => {
                if (!this.scene) return;
                if (onHit) onHit();
            });
        }




        
        // Synced attack bump: 400ms out, 400ms back
        this.scene.tweens.add({
            targets: this,
            x: this.x + dx * 45,
            y: this.y + dy * 45,

            yoyo: true,
            duration: 400,
            ease: 'Cubic.easeOut',
            onUpdate: () => {
                this.healthBar.updatePosition(this.x, this.y - 40);
            },
            onComplete: () => {
                this.isMoving = false;
                this.play(`${animDir} - Idle`, true);
                if (onComplete) onComplete();
            }
        });


    }
    
    die(onComplete) {
        if (!this.scene) return;
        this.isMoving = true;
        this.healthBar.destroy();
        
        // Use the red death animation for extra impact
        const animName = `${this.lastDir} - Death_red`;

        if (this.scene.anims && this.scene.anims.exists(animName)) {
            // Stop on the last frame (don't disappear)
            this.play(animName, true);
            this.once('animationcomplete', (animation) => {
                if (animation.key === animName) {
                    this.setFrame(animation.frames[animation.frames.length - 1].frame.name);
                    this.stop();
                }
            });
        }

        // Death sequence duration (approx 1 second for message display)
        if (this.scene.time) {
            this.scene.time.delayedCall(1500, () => {
                if (!this.scene) return;
                if (onComplete) onComplete();
            });
        }
    }


}

