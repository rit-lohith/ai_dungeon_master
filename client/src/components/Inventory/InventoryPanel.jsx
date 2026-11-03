import React from 'react';
import usePlayerStore from '../../store/PlayerStore';
import useGameStore from '../../store/GameStore';
import ItemSlot from './ItemSlot';

export default function InventoryPanel() {
    const { inventory } = usePlayerStore();
    const { isInventoryOpen, toggleInventory } = useGameStore();
    
    // Fixed size of 10
    const slots = Array(10).fill(null);
    inventory.forEach((item, i) => {
        slots[i] = item;
    });

    return (
        <div className={`absolute bottom-6 right-6 pointer-events-auto transition-all duration-500 ease-out z-[30] ${isInventoryOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95 pointer-events-none'}`}>
            <div className="bg-panelBg/95 border-2 border-accent p-6 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl min-w-[320px]">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                    <div className="flex flex-col">
                        <h2 className="text-accent text-xl font-fantasy tracking-wider">INVENTORY</h2>
                        <span className="text-[10px] text-gray-400 font-pixel uppercase tracking-widest mt-1">
                            Capacity: {inventory.length}/10
                        </span>
                    </div>
                </div>

                {/* Slots Grid */}
                <div className="grid grid-cols-5 gap-3">
                    {slots.map((item, idx) => (
                        <ItemSlot key={idx} item={item} index={idx} />
                    ))}
                </div>

                {/* Footer Section */}
                <div className="mt-6 flex flex-col items-center gap-2">
                    <div className="w-full h-px bg-white/5" />
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2 animate-pulse">
                        <span className="bg-gray-800 px-2 py-0.5 rounded border border-gray-600 text-white shadow-inner">[I]</span>
                        <span>TO TOGGLE VIEW</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
