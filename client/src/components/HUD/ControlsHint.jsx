import React, { useState, useEffect } from 'react';

const ControlsHint = () => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
        }, 8000); // Hide after 8 seconds

        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 animate-fade-in pointer-events-none">
            <div className="bg-panelBg/80 backdrop-blur-md border-2 border-accent/30 p-6 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)] flex gap-12 items-center">
                {/* Movement Controls */}
                <div className="flex flex-col items-center gap-4">
                    <div className="grid grid-cols-3 gap-2">
                        <div />
                        <Key icon="↑" label="UP" />
                        <div />
                        <Key icon="←" label="LEFT" />
                        <Key icon="↓" label="DOWN" />
                        <Key icon="→" label="RIGHT" />
                    </div>
                </div>

                <div className="w-px h-16 bg-white/10" />

                {/* Attack Controls */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-2 items-center">
                        <div className="px-4 h-10 bg-gray-600/40 border-2 border-gray-400/50 rounded-lg flex items-center justify-center text-white/90 text-xs font-bold shadow-inner">
                            SPACE
                        </div>
                        <span className="text-accent font-pixel text-[10px] tracking-widest ml-1">ATTACK</span>
                    </div>
                </div>

                <div className="w-px h-16 bg-white/10" />

                {/* Inventory Controls */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-2 items-center">
                        <Key icon="I" label="INV" />
                    </div>
                </div>
            </div>
            
            <p className="text-gray-400 text-[10px] uppercase tracking-[0.4em] animate-pulse">
                Master your destiny through movement
            </p>
        </div>
    );
};

const Key = ({ icon, label }) => (
    <div className="flex flex-col items-center gap-1">
        <div className="w-8 h-8 bg-gray-600/40 border-2 border-gray-400/50 rounded-lg flex items-center justify-center text-white font-bold shadow-inner text-sm">
            {icon}
        </div>
        <span className="text-[8px] text-gray-500 font-bold">{label}</span>
    </div>
);

export default ControlsHint;
