import React, { useState } from 'react';
import ItemTooltip from './ItemTooltip';
import InventorySystem from '../../game/systems/InventorySystem';

export default function ItemSlot({ item, index }) {
    const [isHovered, setIsHovered] = useState(false);

    const handleClick = () => {
        if (item) {
            InventorySystem.useItem(index);
        }
    };

    return (
        <div 
            className="relative w-14 h-14 bg-black/40 border-2 border-white/5 rounded-xl flex items-center justify-center cursor-pointer hover:border-accent hover:bg-black/60 transition-all duration-200 group overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
        >
            {item ? (
                <span className="text-3xl filter drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{item.icon}</span>
            ) : (
                <span className="text-gray-800 text-[10px] font-bold select-none opacity-30">{index + 1}</span>
            )}
            
            {isHovered && item && <ItemTooltip item={item} />}
        </div>
    );
}
