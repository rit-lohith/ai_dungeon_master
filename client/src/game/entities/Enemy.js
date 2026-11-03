import Phaser from 'phaser';
import { TILE_SIZE } from '../../utils/constants';
import HealthBar from '../components/HealthBar';


export default class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, key, data) {
        // Switch between goblin and orc assets based on the enemy ID
        // Note: Bosses and Guardians use the larger Orc model
        const enemyType = (data.id === 'orc' || data.id === 'boss' || data.id === 'guardian') ? 'orc' : 'goblin';
        super(scene, x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, `${enemyType}_idle`, 0);


        scene.add.existing(this);
        
        this.gridX = x;
        this.gridY = y;
        this.isMoving = false;
        this.dataStats = data;
        this.lastDir = 'Front';

        // Real-time AI state
        this.nextActionTime = 0;
        this.actionInterval = data.id === 'orc' ? 800 : 600; // Increased speed for challenge
        this.lastAttackTime = 0;
        this.attackCooldown = 1200; // Snappier recovery


        
        // Setup Animations (similar to Player.js)
        // Precise Row Mapping as per user feedback: Down=0, Up=1, Left=2, Right=3
        const directions = { 'Front': 0, 'Back': 1, 'Left': 2, 'Right': 3 };




        const actionFrameCounts = {
            'Idle': 6, 'Walk': 6, 'Run': 6, 'Attack': 6, 'Hurt': 6, 'Death': 7
        };

        const createEnemyAnim = (name, sheet, row, frames, frameRate = 10, repeat = -1) => {
            const animKey = `enemy_${data.id}_${name}`;
            if (!scene.anims.exists(animKey)) {
                const texture = scene.textures.get(sheet);
                // Dynamically calculate columns based on sheet width (64x64 frames)
                const cols = Math.floor(texture.source[0].width / 64);
                
                scene.anims.create({
                    key: animKey,
                    frames: scene.anims.generateFrameNumbers(sheet, { 
                        start: row * cols,
                        end: row * cols + (frames - 1) 
                    }),
                    frameRate: frameRate,
                    repeat: repeat
                });
            }
            return animKey;
        };


        ['Idle', 'Walk', 'Run', 'Attack', 'Hurt', 'Death'].forEach(action => {
            const sheet = `${enemyType}_${action.toLowerCase()}`;
            Object.entries(directions).forEach(([dir, row]) => {
                const frames = actionFrameCounts[action];
                createEnemyAnim(`${dir} - ${action}`, sheet, row, frames, 10, (action === 'Attack' || action === 'Death' || action === 'Hurt') ? 0 : -1);
            });
        });

        this.hp = data.isBoss ? data.hp * 3 : data.hp;
        
        // Increase scale for visibility
        this.setScale(2.0);
        
        if (data.isBoss) {
            this.setScale(3.0);
        }
        
        this.play(`enemy_${data.id}_Front - Idle`);
        this.baseTint = 0xffffff;

        this.maxHp = data.isBoss ? data.hp * 3 : data.hp;
        this.hp = this.maxHp;
        this.healthBar = new HealthBar(scene, this.x, this.y - 40, data.isBoss ? 60 : 36, 6);


    }


    playAnim(action, repeat = true) {
        if (!this.scene || !this.scene.anims) return;
        const animKey = `enemy_${this.dataStats.id}_${this.lastDir} - ${action}`;
        if (this.scene.anims.exists(animKey)) {
            this.play(animKey, repeat);
        }
    }



    move(dx, dy) {
        if (this.isMoving) return;
        this.isMoving = true;
        
        if (dx > 0) this.lastDir = 'Right';
        else if (dx < 0) this.lastDir = 'Left';
        else if (dy > 0) this.lastDir = 'Front';
        else if (dy < 0) this.lastDir = 'Back';

        this.gridX += dx;
        this.gridY += dy;
        
        this.playAnim('Walk');
        
        this.scene.tweens.add({
            targets: this,
            x: this.gridX * TILE_SIZE + TILE_SIZE / 2,
            y: this.gridY * TILE_SIZE + TILE_SIZE / 2,
            duration: 200,
            onUpdate: () => {
                this.healthBar.updatePosition(this.x, this.y - 40);
            },
            onComplete: () => {

                if (!this.scene) return;
                this.isMoving = false;
                this.playAnim('Idle');
            }
        });
    }


    attack(targetX, targetY, onHit, onComplete) {
        if (this.isMoving || !this.scene) return;
        this.isMoving = true;

        const dx = targetX - this.gridX;
        const dy = targetY - this.gridY;
        
        // Prioritize vertical facing if dx is 0
        if (Math.abs(dx) > Math.abs(dy)) {
            this.lastDir = dx > 0 ? 'Right' : 'Left';
        } else {
            this.lastDir = dy > 0 ? 'Front' : 'Back';
        }

        this.playAnim('Attack', false);

        // Trigger onHit mid-animation (frame 3 approx 300ms)
        this.scene.time.delayedCall(300, () => {
            if (!this.scene) return;
            if (onHit) onHit();
        });


        // Bump animation (300ms out, 300ms back = 600ms total)
        this.scene.tweens.add({
            targets: this,
            x: this.x + dx * 30,
            y: this.y + dy * 30,

            duration: 300,
            yoyo: true,
            onComplete: () => {
                if (!this.scene) return;
                this.isMoving = false;
                this.playAnim('Idle');
                if (onComplete) onComplete();
            }
        });
    }







    takeDamage(amount) {
        this.hp -= amount;
        this.healthBar.setPercent((this.hp / this.maxHp) * 100);

        
        this.playAnim('Hurt', false);
        
        // Flash red
        this.setTint(0xff0000);
        if (this.scene && this.scene.time) {
            this.scene.time.delayedCall(300, () => {
                if (!this.scene) return;
                this.setTint(this.baseTint);
                if (this.hp > 0) {
                    this.playAnim('Idle');
                }
            });
        }



        return this.hp <= 0;
    }


    die(onComplete) {
        if (!this.scene) return;
        this.isMoving = true;
        this.healthBar.destroy();
        this.playAnim('Death', false);

        // Spawn death particles
        if (this.scene.events) {
            this.scene.events.emit('spawnDeath', this.x, this.y);
        }


        // Fade out during death

        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                if (onComplete) onComplete();
            }
        });
    }

}

