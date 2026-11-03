import React from 'react';
import useGameStore from '../../store/GameStore';
import usePlayerStore from '../../store/PlayerStore';
import { SCENES } from '../../utils/constants';

export default function GameOver() {
    const { setScene, resetGame } = useGameStore();
    const { resetPlayer } = usePlayerStore();

    const handleRestart = () => {
        resetGame();
        resetPlayer();
        setScene(SCENES.GAME);
    };

    const handleBackToMenu = () => {
        resetGame();
        resetPlayer();
        setScene(SCENES.MENU);
    };

    return (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-4 z-[100] pointer-events-auto backdrop-blur-md animate-fade-in">
            <div className="bg-panelBg border-2 border-red-900/50 p-10 flex flex-col items-center gap-8 w-80 rounded-2xl shadow-[0_0_50px_rgba(127,29,29,0.4)] relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
                
                <div className="flex flex-col items-center gap-2">
                    <h2 className="text-red-600 text-5xl font-fantasy tracking-tighter drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                        GAME OVER
                    </h2>
                    <div className="w-16 h-1 bg-red-900/50 rounded-full" />
                </div>

                <p className="text-gray-400 text-center text-sm leading-relaxed font-pixel uppercase tracking-widest">
                    The darkness has claimed your soul. Your journey ends here... for now.
                </p>
                
                <div className="flex flex-col gap-4 w-full mt-4">
                    <button 
                        onClick={handleRestart} 
                        className="group relative bg-red-900/20 hover:bg-red-800/40 text-red-100 rounded-lg py-4 border border-red-900/50 transition-all duration-300 font-bold tracking-[0.2em] shadow-lg hover:shadow-red-900/20"
                    >
                        <span className="relative z-10">RESTART JOURNEY</span>
                        <div className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-10 transition-opacity rounded-lg" />
                    </button>
                    
                    <button 
                        onClick={handleBackToMenu} 
                        className="bg-transparent hover:bg-gray-800/50 text-gray-500 hover:text-gray-300 rounded-lg py-3 border border-gray-800 transition-all duration-300 text-xs font-bold tracking-[0.1em]"
                    >
                        BACK TO LANDING PAGE
                    </button>
                </div>
            </div>
        </div>
    );
}
