import CombatSystem from './CombatSystem';

/**
 * AISystem handles optimal pathfinding and swarm intelligence for enemies.
 * It uses A* for navigation and a Coordinated Slot Assignment strategy for swarming.
 */
export default class AISystem {
    /**
     * Finds the shortest path between two points using A*
     * @param {number} startX 
     * @param {number} startY 
     * @param {number} endX 
     * @param {number} endY 
     * @param {object} map - The TileMap instance
     * @param {Array} otherEntities - Positions of other enemies to avoid
     * @returns {Array|null} Array of {x, y} coordinates for the path
     */
    static findPath(startX, startY, endX, endY, map, otherEntities = []) {
        if (!map.isWalkable(endX, endY)) return null;

        const openSet = [];
        const closedSet = new Set();
        const cameFrom = new Map();
        
        const gScore = new Map();
        const fScore = new Map();

        const posToKey = (x, y) => `${x},${y}`;
        const keyToPos = (key) => {
            const [x, y] = key.split(',').map(Number);
            return { x, y };
        };

        const startKey = posToKey(startX, startY);
        openSet.push(startKey);
        gScore.set(startKey, 0);
        fScore.set(startKey, Math.abs(endX - startX) + Math.abs(endY - startY));

        while (openSet.length > 0) {
            // Get node with lowest fScore
            let currentKey = openSet[0];
            let minF = fScore.get(currentKey);
            let currentIndex = 0;

            for (let i = 1; i < openSet.length; i++) {
                const score = fScore.get(openSet[i]);
                if (score < minF) {
                    minF = score;
                    currentKey = openSet[i];
                    currentIndex = i;
                }
            }

            const current = keyToPos(currentKey);
            if (current.x === endX && current.y === endY) {
                // Reconstruct path
                const path = [];
                let temp = currentKey;
                while (cameFrom.has(temp)) {
                    path.unshift(keyToPos(temp));
                    temp = cameFrom.get(temp);
                }
                return path;
            }

            openSet.splice(currentIndex, 1);
            closedSet.add(currentKey);

            const neighbors = [
                { x: current.x + 1, y: current.y },
                { x: current.x - 1, y: current.y },
                { x: current.x, y: current.y + 1 },
                { x: current.x, y: current.y - 1 }
            ];

            for (const neighbor of neighbors) {
                const neighborKey = posToKey(neighbor.x, neighbor.y);
                if (closedSet.has(neighborKey) || !map.isWalkable(neighbor.x, neighbor.y)) continue;

                // Optimization: Favor paths not occupied by other entities
                const isOccupied = otherEntities.some(e => e.gridX === neighbor.x && e.gridY === neighbor.y);
                const weight = isOccupied ? 10 : 1; 

                const tentativeGScore = (gScore.get(currentKey) || 0) + weight;

                if (!openSet.includes(neighborKey)) {
                    openSet.push(neighborKey);
                } else if (tentativeGScore >= (gScore.get(neighborKey) || Infinity)) {
                    continue;
                }

                cameFrom.set(neighborKey, currentKey);
                gScore.set(neighborKey, tentativeGScore);
                fScore.set(neighborKey, tentativeGScore + Math.abs(endX - neighbor.x) + Math.abs(endY - neighbor.y));
            }
        }

        return null;
    }

    /**
     * Processes turns for all enemies using swarm coordination
     * @param {Array} enemies 
     * @param {object} player 
     * @param {object} map 
     * @param {object} scene 
     */
    static processEnemyTurns(enemies, player, map, scene) {
        // 1. Identify "Attack Slots" around the player
        const slots = [
            { x: player.gridX + 1, y: player.gridY },
            { x: player.gridX - 1, y: player.gridY },
            { x: player.gridX, y: player.gridY + 1 },
            { x: player.gridX, y: player.gridY - 1 }
        ].filter(s => map.isWalkable(s.x, s.y));

        // 2. Filter enemies that are close enough to care (within 10 tiles)
        const activeEnemies = enemies.filter(enemy => {
            const dist = Math.abs(enemy.gridX - player.gridX) + Math.abs(enemy.gridY - player.gridY);
            return dist < 10;
        });

        // 3. Sort enemies by distance to player (closest first to claim slots)
        activeEnemies.sort((a, b) => {
            const distA = Math.abs(a.gridX - player.gridX) + Math.abs(a.gridY - player.gridY);
            const distB = Math.abs(b.gridX - player.gridX) + Math.abs(b.gridY - player.gridY);
            return distA - distB;
        });

        const claimedSlots = new Set();
        const nextPositions = new Map(); // enemyId -> {x, y}

        activeEnemies.forEach(enemy => {
            // Priority 1: Attack if already adjacent
            const dist = Math.abs(enemy.gridX - player.gridX) + Math.abs(enemy.gridY - player.gridY);
            if (dist === 1) {
                enemy.attack(player.gridX, player.gridY, () => {
                    const result = CombatSystem.enemyAttack(enemy);
                    scene.showFloatingText(player.x, player.y - 20, `-${result.damage}`, 0xff0000);
                    scene.cameras.main.shake(150, 0.01);
                    scene.sparks.emitParticleAt(player.x, player.y, 10);
                    if (result.killed) scene.gameOver();
                });
                return;
            }

            // Priority 2: Swarm Coordination - Find best unoccupied slot
            let bestPath = null;
            let bestSlot = null;

            for (const slot of slots) {
                const slotKey = `${slot.x},${slot.y}`;
                if (claimedSlots.has(slotKey)) continue;

                // Check other enemies for collision at slot
                const isPhysicallyOccupied = enemies.some(e => e !== enemy && e.gridX === slot.x && e.gridY === slot.y);
                if (isPhysicallyOccupied) continue;

                const path = this.findPath(enemy.gridX, enemy.gridY, slot.x, slot.y, map, enemies.filter(e => e !== enemy));
                if (path && (!bestPath || path.length < bestPath.length)) {
                    bestPath = path;
                    bestSlot = slot;
                }
            }

            if (bestPath && bestPath.length > 0) {
                const nextStep = bestPath[0];
                // Coordination: Claim the slot AND the next step to prevent collisions
                claimedSlots.add(`${bestSlot.x},${bestSlot.y}`);
                
                // Move towards slot
                enemy.move(nextStep.x - enemy.gridX, nextStep.y - enemy.gridY);
            } else {
                // No path to a slot found, fallback to simple move if possible or random wiggle (Cohesion)
                this.fallbackMovement(enemy, player, map, enemies);
            }
        });

        // 4. Random wiggle for far away enemies (Simple flocking/roaming)
        enemies.filter(e => !activeEnemies.includes(e)).forEach(enemy => {
            if (Math.random() < 0.1) {
                const dirs = [{x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1}];
                const dir = dirs[Math.floor(Math.random() * dirs.length)];
                if (map.isWalkable(enemy.gridX + dir.x, enemy.gridY + dir.y) && 
                    !enemies.some(e => e.gridX === enemy.gridX + dir.x && e.gridY === enemy.gridY + dir.y)) {
                    enemy.move(dir.x, dir.y);
                }
            }
        });
    }

    static fallbackMovement(enemy, player, map, enemies) {
        // Try to move closer to player even if no slot is reachable
        const dx = Math.sign(player.gridX - enemy.gridX);
        const dy = Math.sign(player.gridY - enemy.gridY);

        const possibleMoves = [];
        if (dx !== 0) possibleMoves.push({x: dx, y: 0});
        if (dy !== 0) possibleMoves.push({x: 0, y: dy});
        
        for (const move of possibleMoves) {
            const nextX = enemy.gridX + move.x;
            const nextY = enemy.gridY + move.y;
            if (map.isWalkable(nextX, nextY) && !enemies.some(e => e.gridX === nextX && e.gridY === nextY)) {
                enemy.move(move.x, move.y);
                return;
            }
        }
    }
}
