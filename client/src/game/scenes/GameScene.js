import Phaser from 'phaser';
import { SCENES, MAP_WIDTH, MAP_HEIGHT, TILE_SIZE } from '../../utils/constants';
import DungeonGenerator from '../world/DungeonGenerator';
import TileMap from '../world/TileMap';
import Player from '../entities/Player';
import Enemy from '../entities/Enemy';
import NPC from '../entities/NPC';
import Item from '../entities/Item';
import usePlayerStore from '../../store/PlayerStore';
import useGameStore from '../../store/GameStore';
import CombatSystem from '../systems/CombatSystem';
import enemyData from '../../data/enemies.json';
import npcData from '../../data/npcs.json';
import itemData from '../../data/items.json';
import { HERO_ATTACK_BARKS, ENEMY_ATTACK_BARKS, ENEMY_DEFEAT_BARKS, HERO_DEFEAT_BARKS, NPC_GREETING_BARKS, HERO_GREETING_BARKS } from '../../data/combatBarks';



export default class GameScene extends Phaser.Scene {
    constructor() {
        super(SCENES.GAME);
    }
    
    create() {
        // Generate World
        const generator = new DungeonGenerator(MAP_WIDTH, MAP_HEIGHT);
        const { grid, rooms, startPos, endPos } = generator.generate(5);
        this.grid = grid;
        this.startPos = startPos;
        this.endPos = endPos;
        this.spawnEnvironment(rooms);
        this.map = new TileMap(this, MAP_WIDTH, MAP_HEIGHT, this.grid);

        // BGM Continuity: Ensure music is playing in the game loop
        if (this.cache.audio.exists('game_bgm')) {
            let bgm = this.sound.get('game_bgm');
            if (!bgm) {
                bgm = this.sound.add('game_bgm', { loop: true, volume: 0 });
            }
            
            if (!bgm.isPlaying) {
                bgm.play();
                this.tweens.add({
                    targets: bgm,
                    volume: 0.8,
                    duration: 2500,
                    ease: 'Linear'
                });
            }
        }


        
        // Spawn Entities
        this.player = new Player(this, startPos.x, startPos.y);
        usePlayerStore.getState().setPosition(startPos.x, startPos.y);
        
        this.spawnEntities(rooms, startPos, endPos);

        useGameStore.getState().setMapGrid(grid);

        // Setup camera
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(2.2);
        this.cameras.main.setBackgroundColor('#000000');

        // Live Boiling Volcano Ground
        this.lava = this.add.tileSprite(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE, 'lava_ground');
        this.lava.setOrigin(0).setDepth(-20).setAlpha(0.85);

        
        // Setup Inputs
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        
        // Prevent Phaser from blocking these keys for the rest of the browser (allows typing in React inputs)
        this.input.keyboard.removeCapture('W,S,A,D,UP,DOWN,LEFT,RIGHT,SPACE');

        // Click-to-Move / Interactivity
        this.input.on('pointerdown', (pointer) => {
            // Adjust for camera scroll and zoom
            const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            
            const gridX = Math.floor(worldPoint.x / TILE_SIZE);
            const gridY = Math.floor(worldPoint.y / TILE_SIZE);
            
            this.handleGridClick(gridX, gridY);
        });

        // Setup Particles
        this.sparks = this.add.particles(0, 0, 'spark', {
            speed: { min: -100, max: 100 },
            angle: { min: 0, max: 360 },
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            lifespan: 500,
            emitting: false
        });

        this.deathParticles = this.add.particles(0, 0, 'spark', {
            speed: { min: -50, max: 50 },
            scale: { start: 2, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1500,
            tint: 0xff0000,
            emitting: false
        });
        // Particle Event Listeners
        this.events.on('spawnDeath', (x, y) => {
            this.deathParticles.emitParticleAt(x, y, 20);
        });
    }



    handleGridClick(gridX, gridY) {
        if (this.player.isMoving || (useGameStore.getState().currentScene !== SCENES.GAME && useGameStore.getState().currentScene !== SCENES.DIALOGUE)) return;

        const dx = Math.sign(gridX - this.player.gridX);
        const dy = Math.sign(gridY - this.player.gridY);

        if (dx === 0 && dy === 0) return;

        // For simplicity, we move one step toward the clicked tile
        // If the clicked tile is adjacent, it behaves like a regular move/attack
        // If it's farther away, it moves the player one step closer
        
        // Priority: move horizontally first, or vertically if horizontally is same
        let moveX = 0;
        let moveY = 0;
        
        if (Math.abs(gridX - this.player.gridX) > Math.abs(gridY - this.player.gridY)) {
            moveX = dx;
        } else {
            moveY = dy;
        }

        this.handleMove(moveX, moveY);
    }


    spawnEntities(rooms, startPos, endPos) {
        this.enemies = [];
        this.npcs = [];
        this.items = [];
        const occupiedTiles = new Set();
        occupiedTiles.add(`${startPos.x},${startPos.y}`);
        occupiedTiles.add(`${endPos.x},${endPos.y}`);

        rooms.forEach((room) => {
            const centerX = room.x + Math.floor(room.w / 2);
            const centerY = room.y + Math.floor(room.h / 2);

            // Helper to get a unique reachable tile near center
            const getValidTile = (baseX, baseY) => {
                for (let r = 0; r < 3; r++) { // Spiraling search radius 0-2
                    for (let dy = -r; dy <= r; dy++) {
                        for (let dx = -r; dx <= r; dx++) {
                            const tx = baseX + dx;
                            const ty = baseY + dy;
                            if (this.map.isWalkable(tx, ty) && !occupiedTiles.has(`${tx},${ty}`)) {
                                return { x: tx, y: ty };
                            }
                        }
                    }
                }
                return null;
            };

            // BOSS Placement: In the end room
            if (centerX === endPos.x && centerY === endPos.y) {
                const bTile = getValidTile(centerX, centerY);
                if (bTile) {
                    const bData = enemyData.find(e => e.isBoss) || enemyData[enemyData.length - 1];
                    const boss = new Enemy(this, bTile.x, bTile.y, bData.id, bData);
                    this.enemies.push(boss);
                    occupiedTiles.add(`${bTile.x},${bTile.y}`);
                }
                return;
            }

            // SAFE ZONE: No enemies in the start room where the player spawns
            if (centerX === startPos.x && centerY === startPos.y) {
                // We still want a chance for a friendly NPC or item in the start room
                if (Math.random() < 0.3) {
                    const nTile = getValidTile(centerX, centerY);
                    if (nTile) {
                         const npcId = npcData[Math.floor(Math.random() * npcData.length)].id;
                         const data = npcData.find(n => n.id === npcId);
                         if (data) {
                             const npc = new NPC(this, nTile.x, nTile.y, data.id, data);
                             this.npcs.push(npc);
                             occupiedTiles.add(`${nTile.x},${nTile.y}`);
                         }
                    }
                }
                return;
            }

            const rand = Math.random();
            if (rand < 0.6) { // Enemy chance
                const count = Math.random() > 0.8 ? 2 : 1;
                for (let i = 0; i < count; i++) {
                    const eTile = getValidTile(centerX, centerY);
                    if (eTile) {
                        const eData = enemyData[Math.floor(Math.random() * (enemyData.length - 2))]; 
                        const enemy = new Enemy(this, eTile.x, eTile.y, eData.id, eData);
                        this.enemies.push(enemy);
                        occupiedTiles.add(`${eTile.x},${eTile.y}`);
                    }
                }
            } else if (rand < 0.8) { // NPC chance
                const nTile = getValidTile(centerX, centerY);
                if (nTile) {
                    const npcId = npcData[Math.floor(Math.random() * npcData.length)].id;
                    const data = npcData.find(n => n.id === npcId);
                    if (data) {
                        const npc = new NPC(this, nTile.x, nTile.y, data.id, data);
                        this.npcs.push(npc);
                        occupiedTiles.add(`${nTile.x},${nTile.y}`);
                    }

                }
            }

            // Always chance for an item in a room
            if (Math.random() < 0.4) {
                const iTile = getValidTile(centerX, centerY);
                if (iTile) {
                    const roomItems = ['health_potion', 'strength_potion'];
                    const itemId = roomItems[Math.floor(Math.random() * roomItems.length)];
                    const data = itemData.find(i => i.id === itemId);
                    if (data) {
                        const item = new Item(this, iTile.x, iTile.y, data.id, data);
                        this.items.push(item);
                        occupiedTiles.add(`${iTile.x},${iTile.y}`);
                    }
                }
            }
        });

        // 4. CORRIDOR LIFE: Spawning Items on Paths (Type 7)
        for (let y = 0; y < this.map.height; y++) {
            for (let x = 0; x < this.map.width; x++) {
                if (this.grid[y][x] === 7 && Math.random() < 0.015) {
                     const roadItems = ['health_potion', 'strength_potion'];
                     const itemId = roadItems[Math.floor(Math.random() * roadItems.length)];
                     const data = itemData.find(i => i.id === itemId);
                     if (data) {
                         this.items.push(new Item(this, x, y, data.id, data));
                     }
                }
            }
        }

        this.updateObjectStore();
    }


    updateObjectStore() {

        const enemies = this.enemies.map(e => ({
            x: e.gridX,
            y: e.gridY,
            type: e.dataStats.id
        }));
        const items = this.items.map(i => ({ x: i.gridX, y: i.gridY }));
        const npcs = this.npcs.map(n => ({ x: n.gridX, y: n.gridY }));

        const store = useGameStore.getState();
        store.setEnemyPositions(enemies);
        store.setItemPositions(items);
        store.setNpcPositions(npcs);
    }

    updateEnemyStore() {
        // Now handled by updateObjectStore
        this.updateObjectStore();
    }


    
    update(time, delta) {
        if (!this.player) return;

        // Suspend update if player is typing in an HTML input field
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;

        // Animate Boiling Lava
        if (this.lava) {
            this.lava.tilePositionX += 0.2;
            this.lava.tilePositionY += 0.1;
            // Subtle boiling pulse
            this.lava.setAlpha(0.8 + Math.sin(time / 1000) * 0.1);
        }

        if(useGameStore.getState().currentScene !== SCENES.GAME && useGameStore.getState().currentScene !== SCENES.DIALOGUE) return;
        
        const now = time;

        // 1. Process Attack Input (Continuous isDown for smoothness)
        if (this.cursors.space.isDown) {
            if (this.player.isMoving) {
                this.player.attackBuffered = true; // Buffer it for when move ends
            } else {
                this.handleManualAttack(now);
            }
        }

        // 2. Process Autonomous Enemy AI
        this.updateEnemyAI(now);

        // 3. Process Player Movement (Continuous with Cooldown)
        if (this.player.isMoving) return;
        if (now < this.player.lastMoveTime + this.player.moveCooldown) return;

        let dx = 0; let dy = 0;
        if (this.cursors.up.isDown || this.wasd.W.isDown) { dy = -1; this.player.lastDir = 'Back'; }
        else if (this.cursors.down.isDown || this.wasd.S.isDown) { dy = 1; this.player.lastDir = 'Front'; }
        else if (this.cursors.left.isDown || this.wasd.A.isDown) { dx = -1; this.player.lastDir = 'Left'; }
        else if (this.cursors.right.isDown || this.wasd.D.isDown) { dx = 1; this.player.lastDir = 'Right'; }

        if (dx !== 0 || dy !== 0) {
            this.player.lastMoveTime = now;
            this.handleMove(dx, dy);
        }
    }


    handleManualAttack(now) {
        if (now < this.player.lastAttackTime + this.player.attackCooldown) return;
        this.player.lastAttackTime = now;

        // Melee Range: 3.0 tiles (Clear distance for large sprites)
        const MELEE_RANGE = 3.0;
        let targetEnemy = null;
        let minDistance = Infinity;

        // Find enemies in reach and in the correct general direction
        this.enemies.forEach(enemy => {
            const dx = enemy.gridX - this.player.gridX;
            const dy = enemy.gridY - this.player.gridY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= MELEE_RANGE) {
                // Check if enemy is in the direction we are facing (Wide Arc)
                let inDirection = false;
                switch(this.player.lastDir) {
                    case 'Front': if (dy > 0 && Math.abs(dx) <= 2) inDirection = true; break;
                    case 'Back':  if (dy < 0 && Math.abs(dx) <= 2) inDirection = true; break;
                    case 'Left':  if (dx < 0 && Math.abs(dy) <= 2) inDirection = true; break;
                    case 'Right': if (dx > 0 && Math.abs(dy) <= 2) inDirection = true; break;
                }

                if (inDirection && dist < minDistance) {
                    minDistance = dist;
                    targetEnemy = enemy;
                }
            }
        });

        // Determine visual bump direction (fallback to lastDir if no enemy)
        let bx = 0, by = 0;
        switch(this.player.lastDir) {
            case 'Front': by = 1; break;
            case 'Back': by = -1; break;
            case 'Left': bx = -1; break;
            case 'Right': bx = 1; break;
        }

        const enemyIndex = targetEnemy ? this.enemies.indexOf(targetEnemy) : -1;

        // Trigger the attack animation
        this.player.attack(bx, by, () => {
            if (targetEnemy) {
                const result = CombatSystem.playerAttack(targetEnemy);
                this.showFloatingText(targetEnemy.x, targetEnemy.y - 20, `-${result.damage}`, 0xff0000);
                targetEnemy.takeDamage(result.damage);
                this.cameras.main.shake(100, 0.005);
                this.sparks.emitParticleAt(targetEnemy.x, targetEnemy.y, 15);
                
                // Play combat sound effects
                if (this.cache.audio.exists('sword_hit')) {
                    this.sound.play('sword_hit', { volume: 0.6 });
                }

                if (result.killed) this.handleEnemyDeath(targetEnemy, enemyIndex);
            }
        });
    }

    handleEnemyDeath(enemy, index) {
        const deathBark = ENEMY_DEFEAT_BARKS[Math.floor(Math.random() * ENEMY_DEFEAT_BARKS.length)];
        this.showFloatingText(enemy.x, enemy.y - 40, deathBark, 0xff0000, true);
        
        import('../../store/NPCStore').then(m => {
            m.default.getState().addMemory(enemy.dataStats.id, deathBark, 'npc');
        });

        // XP and Level Up logic
        const oldLevel = usePlayerStore.getState().stats.level;
        usePlayerStore.getState().gainXp(enemy.dataStats.xp || 10);
        const newLevel = usePlayerStore.getState().stats.level;
        if (newLevel > oldLevel) {
            this.showFloatingText(this.player.x, this.player.y - 40, `LEVEL UP! (${newLevel})`, 0xffff00);
        }

        // Loot logic
        if (enemy.dataStats.isBoss || enemy.dataStats.isGuardian) {
            import('../systems/LootSystem').then(m => {
                const loot = m.default.generateLoot(useGameStore.getState().dungeonLevel, enemy.dataStats.isBoss);
                usePlayerStore.getState().addItem(loot);
                this.showFloatingText(this.player.x, this.player.y - 60, `LOOT: ${loot.name}!`, 0x00ff00);
            });
        }

        if (enemy.dataStats.isBoss) {
            useGameStore.getState().setBossDefeated(true);
            this.showFloatingText(this.player.x, this.player.y - 80, "EXIT SEAL BROKEN!", 0xff00ff);
        }

        enemy.die(() => {
            this.enemies.splice(index, 1);
            enemy.destroy();
            this.updateObjectStore();
        });
    }


    
    handleMove(dx, dy) {
        const nextX = this.player.gridX + dx;
        const nextY = this.player.gridY + dy;

        // Check for collision with enemy (Simple Bump)
        const enemy = this.enemies.find(e => e.gridX === nextX && e.gridY === nextY);
        if (enemy) {
            this.triggerDialogue(enemy);
            this.player.moveBump(dx, dy);
            return;
        }

        // Check for collision with NPC
        const npc = this.npcs.find(n => n.gridX === nextX && n.gridY === nextY);
        if (npc) {
            this.triggerDialogue(npc);
            this.player.moveBump(dx, dy);
            return;
        }

        if (this.map.isWalkable(nextX, nextY)) {
            this.player.move(dx, dy, this.map, () => {
                usePlayerStore.getState().setPosition(this.player.gridX, this.player.gridY);
                
                // Process Attack Buffer: If space was hit during travel, fire now!
                if (this.player.attackBuffered) {
                    this.player.attackBuffered = false;
                    this.handleManualAttack(this.time.now);
                }

                // WIN CONDITION: Reach End Tile (Tile 4)

                if (this.map.mapData[this.player.gridY][this.player.gridX] === 4) {
                    if (useGameStore.getState().isBossDefeated) {
                        this.nextLevel();
                    } else {
                        this.showFloatingText(this.player.x, this.player.y - 40, "DEFEAT THE BOSS FIRST!", 0xff0000);
                    }
                }

                // Pickup Items
                const itemIndex = this.items.findIndex(i => i.gridX === this.player.gridX && i.gridY === this.player.gridY);
                if (itemIndex !== -1) {
                    const item = this.items[itemIndex];
                    usePlayerStore.getState().addItem(item.itemData);
                    this.items.splice(itemIndex, 1);
                    item.destroy();
                    this.showFloatingText(this.player.x, this.player.y - 40, "loot collected", 0xffff00, true);
                    this.updateObjectStore();
                }
            });
        }
    }

    updateEnemyAI(now) {

        let activeAggressors = 0;
        const maxAggressors = 4;

        this.enemies.forEach((enemy, index) => {
            if (enemy.hp <= 0 || !enemy.scene || enemy.isMoving) return;
            if (now < enemy.nextActionTime) return;

            const dx_abs = Math.abs(enemy.gridX - this.player.gridX);
            const dy_abs = Math.abs(enemy.gridY - this.player.gridY);
            const dist = dx_abs + dy_abs;
            
            if (dist < 8) {
                if (dist > 1 && activeAggressors >= maxAggressors) return;
                if (dist > 1) activeAggressors++;
 
                // Priority 1: Attack if adjacent (including diagonals)
                if (dx_abs <= 1 && dy_abs <= 1) {
                    if (now < enemy.lastAttackTime + enemy.attackCooldown) return;
                    
                    enemy.attack(this.player.gridX, this.player.gridY, () => {
                        const result = CombatSystem.enemyAttack(enemy);
                        this.showFloatingText(this.player.x, this.player.y - 20, `-${result.damage}`, 0xff0000);
                        
                        const shakeIntensity = (enemy.dataStats.id === 'orc' || enemy.dataStats.id === 'boss') ? 0.015 : 0.005;
                        this.cameras.main.shake(150, shakeIntensity);
                        
                        this.deathParticles.emitParticleAt(this.player.x, this.player.y, 10);
                        if (result.killed) this.gameOver();
                    });
                    
                    enemy.lastAttackTime = now;
                    enemy.nextActionTime = now + enemy.actionInterval;
                    return;
                }
 
                // Priority 2: Smart Chase (Axis Swapping if blocked)
                const dx = Math.sign(this.player.gridX - enemy.gridX);
                const dy = Math.sign(this.player.gridY - enemy.gridY);
                
                let moveX = 0, moveY = 0;
                // Collision Check: Must avoid other enemies AND the player tile
                const isCellOccupied = (tx, ty) => {
                    const hasEnemy = this.enemies.some(e => e !== enemy && e.gridX === tx && e.gridY === ty);
                    const hasPlayer = this.player.gridX === tx && this.player.gridY === ty;
                    return hasEnemy || hasPlayer;
                };
 
                // Try Primary Axis first
                if (dx_abs >= dy_abs) {
                    // Try X first
                    if (this.map.isWalkable(enemy.gridX + dx, enemy.gridY) && !isCellOccupied(enemy.gridX + dx, enemy.gridY)) {
                        moveX = dx;
                    } else if (dy !== 0 && this.map.isWalkable(enemy.gridX, enemy.gridY + dy) && !isCellOccupied(enemy.gridX, enemy.gridY + dy)) {
                        // X blocked, try Y
                        moveY = dy;
                    }
                } else {
                    // Try Y first
                    if (this.map.isWalkable(enemy.gridX, enemy.gridY + dy) && !isCellOccupied(enemy.gridX, enemy.gridY + dy)) {
                        moveY = dy;
                    } else if (dx !== 0 && this.map.isWalkable(enemy.gridX + dx, enemy.gridY) && !isCellOccupied(enemy.gridX + dx, enemy.gridY)) {
                        // Y blocked, try X
                        moveX = dx;
                    }
                }
 
                if (moveX !== 0 || moveY !== 0) {
                    enemy.move(moveX, moveY);
                    enemy.nextActionTime = now + enemy.actionInterval;
                }
            }
        });
    }

    triggerDialogue(entity) {
        const isEnemy = this.enemies.includes(entity);
        const dialogueType = isEnemy ? 'enemy' : 'npc';
        
        // Pick appropriate arrays based on faction
        const speakingArray = isEnemy ? ENEMY_ATTACK_BARKS : NPC_GREETING_BARKS;
        const responseArray = isEnemy ? HERO_ATTACK_BARKS : HERO_GREETING_BARKS;

        const enemyBark = speakingArray[Math.floor(Math.random() * speakingArray.length)];
        const heroBark = responseArray[Math.floor(Math.random() * responseArray.length)];

        useGameStore.getState().setActiveNPC({
            ...entity.dataStats,
            dialogueType: dialogueType
        });
        useGameStore.getState().setScene(SCENES.DIALOGUE);
        this.scene.launch(SCENES.DIALOGUE);

        import('../../store/NPCStore').then(m => {
            const store = m.default.getState();
            store.addMemory(entity.dataStats.id, enemyBark, 'npc');
            setTimeout(() => {
                store.addMemory(entity.dataStats.id, heroBark, 'player');
            }, 2500);
        });
    }






    showFloatingText(x, y, text, color, isPixel = false) {
        const style = { 
            fontSize: isPixel ? '8px' : '16px', 
            fill: '#' + color.toString(16).padStart(6, '0'), 
            align: 'center', 
            fontStyle: 'bold' 
        };
        
        if (isPixel) {
            style.fontFamily = '"Press Start 2P"';
        }

        const t = this.add.text(x, y, text, style);
        t.setOrigin(0.5);
        this.tweens.add({
            targets: t,
            y: y - 50,
            alpha: 0,
            duration: 2000,
            onComplete: () => t.destroy()
        });
    }


    nextLevel() {
        alert("DUNGEON CLEAR! Descending deeper...");
        const currentLevel = useGameStore.getState().dungeonLevel;
        useGameStore.getState().setDungeonLevel(currentLevel + 1);
        this.scene.restart();
    }

    spawnEnvironment(rooms) {
        rooms.forEach(room => {
            // 1. Single Focal Point (Ensure center is clear for navigation)
            const centerX = room.x + Math.floor(room.w / 2);
            const centerY = room.y + Math.floor(room.h / 2);
            
            let focalPlaced = false;
            // Attempt to place in a corner or offset from center
            for (let attempt = 0; attempt < 15 && !focalPlaced; attempt++) {
                const fx = room.x + 2 + Math.floor(Math.random() * (room.w - 4));
                const fy = room.y + 2 + Math.floor(Math.random() * (room.h - 4));
                
                // BOUNDS CHECK
                if (fy < 0 || fy >= MAP_HEIGHT || fx < 0 || fx >= MAP_WIDTH) continue;

                // Very strict 3-tile buffer for focal objects
                if (this.canPlaceObject(fx, fy, 3)) {
                    this.grid[fy][fx] = 5;
                    focalPlaced = true;
                }
            }

            // 2. Organized Wall-Adjacent Clusters (Small groups of 2-3)
            let clustersPlaced = 0;
            const targetClusters = Math.floor(Math.random() * 2) + 1; // 1 or 2 clusters
            
            for (let attempt = 0; attempt < 30 && clustersPlaced < targetClusters; attempt++) {
                const rx = room.x + Math.floor(Math.random() * room.w);
                const ry = room.y + Math.floor(Math.random() * room.h);
                
                // BOUNDS CHECK
                if (ry < 0 || ry >= MAP_HEIGHT || rx < 0 || rx >= MAP_WIDTH) continue;

                if (this.grid[ry][rx] === 0 && this.isNearWall(rx, ry)) {
                    if (this.canPlaceObject(rx, ry, 2)) {
                        this.grid[ry][rx] = 5;
                        // Try to add 1 neighbor for a cluster
                        const neighbors = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
                        for (const n of neighbors) {
                            const nx = rx + n.x;
                            const ny = ry + n.y;
                            if (ny >= 0 && ny < MAP_HEIGHT && nx >= 0 && nx < MAP_WIDTH) {
                                if (this.canPlaceObject(nx, ny, 1)) {
                                    this.grid[ny][nx] = 5;
                                    break;
                                }
                            }
                        }
                        clustersPlaced++;
                    }
                }
            }
        });

        // 3. New UNIQUE Corridor Spawning (Devil House & Spider Stones on Paths)
        for (let y = 0; y < MAP_HEIGHT; y++) {
            for (let x = 0; x < MAP_WIDTH; x++) {
                // Occasional Spooky Objects on Paths (Type 7)
                if (this.grid[y][x] === 7 && Math.random() < 0.02) {
                    if (this.canPlaceObject(x, y, 1)) {
                         this.grid[y][x] = 5; 
                    }
                }
            }
        }
    }


    canPlaceObject(px, py, minBuffer = 2) {
        if (px < 0 || px >= MAP_WIDTH || py < 0 || py >= MAP_HEIGHT) return false;
        
        // Must be a floor tile
        if (this.grid[py][px] !== 0) return false;

        // Ensure we don't block critical points (Start, End)
        const startDist = Math.abs(px - this.startPos.x) + Math.abs(py - this.startPos.y);
        const endDist = Math.abs(px - this.endPos.x) + Math.abs(py - this.endPos.y);
        if (startDist < 4 || endDist < 4) return false;

        // Check for buffer against EVERYTHING (Walls, Rivers, Roads, other Objects)
        for (let y = py - minBuffer; y <= py + minBuffer; y++) {
            for (let x = px - minBuffer; x <= px + minBuffer; x++) {
                if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
                    const tile = this.grid[y][x];
                    // If neighbor is NOT Floor (0), it's an obstacle or path
                    if (tile !== 0) return false;
                }
            }
        }

        return true;
    }


    isNearWall(x, y) {
        // Safety guard for absolute edges
        if (y <= 0 || y >= MAP_HEIGHT - 1 || x <= 0 || x >= MAP_WIDTH - 1) return true;

        const g = this.grid;
        return (g[y-1][x] === 1 || g[y-1][x] === 2) ||
               (g[y+1][x] === 1 || g[y+1][x] === 2) ||
               (g[y][x-1] === 1 || g[y][x-1] === 2) ||
               (g[y][x+1] === 1 || g[y][x+1] === 2);
    }


    gameOver() {

        // Stop the scene briefly for impact (Hit-Stop)
        this.scene.pause();
        this.cameras.main.flash(500, 255, 0, 0); // Red flash

        setTimeout(() => {
            this.scene.resume();

            // Hero Defeat Bark (Subtitle style)
            const defeatBark = HERO_DEFEAT_BARKS[Math.floor(Math.random() * HERO_DEFEAT_BARKS.length)];
            this.showFloatingText(this.player.x, this.player.y - 40, defeatBark, 0xff0000, true);

            // Large Dramatic Death Message
            const screenCenter = { x: this.cameras.main.worldView.centerX, y: this.cameras.main.worldView.centerY };
            const deathMsg = this.add.text(screenCenter.x, screenCenter.y - 50, "VALIANT EFFORT", {
                fontFamily: '"Press Start 2P"',
                fontSize: '32px',
                fill: '#ff0000',
                stroke: '#000000',
                strokeThickness: 6
            }).setOrigin(0.5).setScrollFactor(0).setAlpha(0).setDepth(1000);

            // Animate message
            this.tweens.add({
                targets: deathMsg,
                y: screenCenter.y - 100,
                alpha: 1,
                duration: 1000,
                ease: 'Power2'
            });

            // Fade screen to black
            this.cameras.main.fade(2000, 0, 0, 0);

            // Play Death Animation then transition
            this.player.die(() => {
                useGameStore.getState().setScene(SCENES.GAMEOVER);
                this.scene.start(SCENES.GAMEOVER);
            });
        }, 200);
    }



}
