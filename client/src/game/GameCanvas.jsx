import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameConfig } from './GameConfig';
import HUD from '../components/HUD/HUD';
import MainMenu from '../components/Menu/MainMenu';
import GameOver from '../components/Menu/GameOver';
import DialogueBox from '../components/Dialogue/DialogueBox';
import InventoryPanel from '../components/Inventory/InventoryPanel';
import PauseMenu from '../components/Menu/PauseMenu';
import useGameStore from '../store/GameStore';
import { SCENES } from '../utils/constants';

const GameCanvas = () => {
    const gameRef = useRef(null);
    const { currentScene, isPaused } = useGameStore();

    useEffect(() => {
        const game = new Phaser.Game(GameConfig);
        gameRef.current = game;

        const handleKeyDown = (e) => {
            if (e.key.toLowerCase() === 'i') {
                const state = useGameStore.getState();
                // Toggle inventory if in game
                if (state.currentScene !== SCENES.BOOT && state.currentScene !== SCENES.MENU) {
                    state.toggleInventory();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            game.destroy(true);
        };
    }, []);

    return (
        <div className="relative w-full h-full font-pixel text-white">
            <div id="phaser-container" className="absolute top-0 left-0 w-full h-full" />
            
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none border-[12px] border-panelBg/50 box-border z-10" />

            {/* UI Overlays */}
            {currentScene === SCENES.BOOT && <div className="absolute top-0 left-0 w-full h-full bg-black flex items-center justify-center z-50"><p>Loading...</p></div>}
            {currentScene === SCENES.MENU && <MainMenu />}
            
            {currentScene !== SCENES.MENU && currentScene !== SCENES.BOOT && (
                <>
                    <HUD />
                    <InventoryPanel />
                    {currentScene === SCENES.DIALOGUE && <DialogueBox />}
                    {currentScene === SCENES.GAMEOVER && <GameOver />}
                    {isPaused && <PauseMenu />}
                </>
            )}
        </div>
    );
};

export default GameCanvas;
