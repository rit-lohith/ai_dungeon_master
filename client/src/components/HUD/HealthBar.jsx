import React from 'react';
import usePlayerStore from '../../store/PlayerStore';

const HealthBar = () => {
    const { stats } = usePlayerStore();
    const hpPercent = Math.max(0, Math.min(100, (stats.hp / stats.maxHp) * 100));
    const isLowHp = hpPercent < 30;
    
    return (
        <div className={`glass-panel p-4 rounded-xl text-xs pointer-events-auto transition-all duration-500 ${isLowHp ? 'border-soul-red shadow-[0_0_15px_rgba(255,51,68,0.3)]' : 'neon-border'}`}>
            <div className="flex justify-between mb-2 items-end">
                <span className="font-fantasy text-lg text-white tracking-widest">SOUL CORE</span>
                <span className={`font-mono text-sm ${isLowHp ? 'text-soul-red animate-pulse' : 'text-accent'}`}>{stats.hp} / {stats.maxHp}</span>
            </div>
            <div className="w-full bg-black/50 h-3 rounded-full overflow-hidden border border-white/10 relative">
                <div 
                    className={`h-full transition-all duration-1000 ease-out z-10 ${isLowHp ? 'bg-soul-red shadow-[0_0_10px_#ff3344]' : 'bg-accent shadow-[0_0_10px_#22d3ee]'}`}
                    style={{ width: `${hpPercent}%` }}
                />
            </div>
            <div className="grid grid-cols-3 gap-10 mt-5 font-inter uppercase tracking-[0.2em] text-gray-400">
                <div className="flex flex-col"><span className="text-gray-500 text-xs mb-1">Attack</span> <span className="text-white text-xl font-bold tracking-tight">{stats.attack}</span></div>
                <div className="flex flex-col"><span className="text-gray-500 text-xs mb-1">Defense</span> <span className="text-white text-xl font-bold tracking-tight">{stats.defense}</span></div>
                <div className="flex flex-col"><span className="text-gray-500 text-xs mb-1">Level</span> <span className="text-accent text-xl font-black tracking-tight">{stats.level}</span></div>
            </div>
        </div>
    );
};
export default HealthBar;
