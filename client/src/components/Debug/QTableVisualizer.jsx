import React from 'react';

export default function QTableVisualizer() {
    return (
        <div className="fixed top-0 right-0 bg-black/80 font-mono text-[8px] text-green-400 p-2 z-[100] h-screen overflow-y-auto w-64 pointer-events-none hidden">
            {/* Visualizer for dev debug */}
            <h3 className="text-white border-b border-gray-700 mb-2 pb-1">AI Q-Table Live</h3>
        </div>
    );
}
