import React, { useEffect, useRef } from 'react';
import useGameStore from '../../store/GameStore';
import usePlayerStore from '../../store/PlayerStore';

export default function MiniMap() {
    const {
        dungeonLevel, mapGrid, enemyPositions,
        itemPositions, npcPositions, isMinimapMaximized, toggleMinimap
    } = useGameStore();
    const { position } = usePlayerStore();
    const canvasRef = useRef(null);

    useEffect(() => {
        if (mapGrid && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            const height = mapGrid.length;
            const width = mapGrid[0].length;

            canvasRef.current.width = width;
            canvasRef.current.height = height;

            const imgData = ctx.createImageData(width, height);
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = (y * width + x) * 4;
                    const tile = mapGrid[y][x];

                    // Walkable: 0 (Room), 3 (Start), 4 (End), 7 (Corridor), 8 (Bridge)
                    const isWalkable = tile === 0 || tile === 3 || tile === 4 || tile === 7 || tile === 8;
                    const isLava = tile === 6;

                    if (isWalkable) {
                        imgData.data[idx] = 120;     // R (Lighter gray for paths)
                        imgData.data[idx + 1] = 120;   // G
                        imgData.data[idx + 2] = 120;   // B
                    } else if (isLava) {
                        imgData.data[idx] = 80;      // R (Deep red for lava)
                        imgData.data[idx + 1] = 20;    // G
                        imgData.data[idx + 2] = 10;    // B
                    } else {
                        imgData.data[idx] = 40;      // R (Dark wall)
                        imgData.data[idx + 1] = 40;    // G
                        imgData.data[idx + 2] = 40;    // B
                    }
                    imgData.data[idx + 3] = 255;                 // A
                }
            }
            ctx.putImageData(imgData, 0, 0);

            // 1. Draw map features (Entrance and Exit)
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const tile = mapGrid[y][x];
                    if (tile === 3) {
                        ctx.fillStyle = '#ffffff'; // Start (White)
                        ctx.fillRect(x - 1, y - 1, 3, 3);
                    } else if (tile === 4) {
                        ctx.fillStyle = '#ff00ff'; // Exit (Purple)
                        ctx.fillRect(x - 1, y - 1, 4, 4);
                    }
                }
            }

            // 2. Draw Items (Cyan)
            if (itemPositions) {
                itemPositions.forEach(item => {
                    ctx.fillStyle = '#00ffff';
                    ctx.fillRect(item.x, item.y, 1, 1);
                });
            }

            // 3. Draw NPCs (Yellow)
            if (npcPositions) {
                npcPositions.forEach(npc => {
                    ctx.fillStyle = '#ffff00';
                    ctx.fillRect(npc.x, npc.y, 1, 1);
                });
            }

            // 4. Draw enemies (Radar)
            if (enemyPositions) {
                enemyPositions.forEach(enemy => {
                    const isBoss = enemy.type === 'boss' || enemy.type === 'guardian';
                    ctx.fillStyle = isBoss ? '#ffaa00' : (enemy.type === 'goblin' ? '#00ff00' : '#ff3333');
                    if (isBoss) {
                        ctx.fillRect(enemy.x - 1, enemy.y - 1, 3, 3);
                    } else {
                        ctx.fillRect(enemy.x, enemy.y, 1, 1);
                    }
                });
            }

            // 5. Draw player
            if (position) {
                ctx.fillStyle = '#0088ff';
                ctx.fillRect(position.x - 1, position.y - 1, 3, 3);
            }
        }
    }, [mapGrid, position, enemyPositions, itemPositions, npcPositions]);

    const sizeClass = isMinimapMaximized ? 'w-64 h-64' : 'w-32 h-32';

    return (
        <div
            onClick={toggleMinimap}
            className={`glass-panel rounded-2xl p-3 ${sizeClass} flex flex-col items-center justify-center pointer-events-auto cursor-pointer shadow-2xl hover:scale-105 transition-all duration-500 group ${isMinimapMaximized ? 'neon-border' : 'border-white/10'}`}
        >
            <span className="text-accent text-[9px] uppercase font-bold tracking-[0.2em] mb-2 opacity-70 group-hover:opacity-100 transition-opacity">
                Dungeon Radar • LEVEL {dungeonLevel}
            </span>
            <div className="w-full h-full bg-black/40 rounded-xl border border-white/5 relative overflow-hidden backdrop-blur-md">
                {mapGrid ? (
                    <canvas ref={canvasRef} className="w-full h-full object-contain" style={{ imageRendering: 'pixelated', filter: 'brightness(1.5) contrast(1.2)' }} />
                ) : (
                    <div className="flex items-center justify-center h-full animate-pulse">
                        <span className="text-[8px] text-gray-500 tracking-widest uppercase">Initializing...</span>
                    </div>
                )}
            </div>
            {isMinimapMaximized && (
                <div className="grid grid-cols-3 gap-x-2 gap-y-1 mt-3 w-full px-2 text-[7px] uppercase tracking-tighter text-gray-400 font-inter">
                    <div className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-white shadow-[0_0_5px_#fff]" /> <span>Origin</span></div>
                    <div className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-[#ff00ff] shadow-[0_0_5px_#f0f]" /> <span>Vault</span></div>
                    <div className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-[#ff3333] animate-pulse shadow-[0_0_5px_#f00]" /> <span>Hostile</span></div>
                </div>
            )}
        </div>
    );
}

