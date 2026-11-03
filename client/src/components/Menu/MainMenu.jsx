import React from 'react';
import useGameStore from '../../store/GameStore';
import { SCENES } from '../../utils/constants';

export default function MainMenu() {
    const { setScene } = useGameStore();

    return (
        <div className="absolute inset-0 bg-[#07070d] bg-gradient-to-b from-[#0a0c16] to-[#040408] flex flex-col items-center justify-center pointer-events-auto z-50 px-4">
            {/* Background glowing particles/circles for atmospheric depth */}
            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-soul-red/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="glass-panel max-w-xl w-full p-12 rounded-3xl border border-white/5 flex flex-col items-center text-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-2xl transition-all duration-500 hover:border-accent/15">
                {/* Decorative neon linear top border */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-80" />

                {/* Sub-label banner */}
                <div className="mb-3 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 animate-pulse">
                    <span className="text-[8px] text-accent font-pixel tracking-[0.25em] uppercase font-bold">
                        Procedural Rogue-RPG
                    </span>
                </div>

                <h1 className="text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-accent font-fantasy mb-4 tracking-widest drop-shadow-[0_5px_15px_rgba(34,211,238,0.2)]">
                    AI Dungeon Master
                </h1>

                <p className="text-gray-400 text-[10px] md:text-xs mb-10 tracking-[0.25em] uppercase max-w-md leading-relaxed font-inter">
                    A quest-driven journey where every step, dialogue, and map structure is woven dynamically by local intelligence.
                </p>
                
                <div className="flex flex-col gap-5 w-72">
                    <button 
                        onClick={() => setScene(SCENES.GAME)}
                        className="group relative w-full bg-accent text-black font-pixel text-xs py-4 px-6 font-bold hover:bg-cyan-300 transition-all duration-300 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_35px_rgba(34,211,238,0.6)] uppercase tracking-[0.2em] rounded-xl hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                    >
                        <span className="relative z-10 font-black">Enter Dungeon</span>
                        {/* Shimmer overlay effect */}
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    </button>
                    
                    <div className="text-[8px] text-gray-500 uppercase tracking-widest mt-2">
                        Requires Ollama phi3 running locally
                    </div>
                </div>
            </div>

            {/* Custom Tailwind animation style injected */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}} />
        </div>
    );
}
