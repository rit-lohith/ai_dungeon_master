import React from 'react';

export default function ItemTooltip({ item }) {
    if (!item) return null;
    
    return (
        <div className="absolute bottom-full mb-2 right-0 w-48 bg-black/90 border border-gray-600 rounded p-2 text-white text-xs z-50 pointer-events-none transform -translate-x-1/2 left-1/2 shadow-xl">
            <div className="font-bold border-b border-gray-700 pb-1 mb-1 capitalize flex justify-between">
                <span className={item.rarity === 'common' ? 'text-gray-300' : item.rarity === 'rare' ? 'text-blue-400' : 'text-purple-400'}>
                    {item.name}
                </span>
                <span className="text-[9px] text-gray-500 uppercase">{item.type}</span>
            </div>
            <p className="text-[10px] text-gray-400 italic mb-1">{item.description || "A mysterious item..."}</p>
            {item.effect && (
                <div className="text-[9px] text-green-400">
                    {Object.entries(item.effect).map(([stat, val]) => (
                        <div key={stat}>+{val} {stat.toUpperCase()}</div>
                    ))}
                </div>
            )}
            
            <div className="absolute -bottom-1 left-1/2 w-2 h-2 bg-black/90 border-r border-b border-gray-600 transform -translate-x-1/2 rotate-45" />
        </div>
    );
}
