import React from 'react';
import useGameStore from '../../store/GameStore';
import SaveManager from '../../services/SaveManager';
import { SCENES } from '../../utils/constants';

export default function PauseMenu() {
    const { togglePause, setScene } = useGameStore();

    const handleSave = () => {
        SaveManager.saveGame();
        togglePause();
    };

    const handleQuit = () => {
        togglePause();
        setScene(SCENES.MENU);
    };

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50 pointer-events-auto backdrop-blur-sm animate-fade-in">
            <div className="bg-panelBg border-2 border-gray-600 p-8 flex flex-col gap-4 w-64 rounded-xl shadow-2xl">
                <h2 className="text-white text-center font-bold text-xl mb-4 font-fantasy tracking-widest border-b border-gray-600 pb-2">PAUSED</h2>
                
                <button onClick={togglePause} className="bg-gray-800 hover:bg-gray-700 text-white rounded py-2 border border-gray-600 transition-colors">
                    RESUME
                </button>
                <button onClick={handleSave} className="bg-gray-800 hover:bg-gray-700 text-white rounded py-2 border border-gray-600 transition-colors">
                    SAVE GAME
                </button>
                <button className="bg-gray-800 hover:bg-gray-700 text-white rounded py-2 border border-gray-600 transition-colors opacity-50 cursor-not-allowed">
                    SETTINGS
                </button>
                <button onClick={handleQuit} className="bg-red-900/50 hover:bg-red-800/80 text-red-200 rounded py-2 border border-red-900 mt-4 transition-colors">
                    QUIT TO MENU
                </button>
            </div>
        </div>
    );
}
