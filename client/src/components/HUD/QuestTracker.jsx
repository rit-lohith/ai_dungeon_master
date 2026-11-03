import React, { useState } from 'react';
import useQuestStore from '../../store/QuestStore';

export default function QuestTracker() {
    const { quests } = useQuestStore();
    const [collapsed, setCollapsed] = useState(false);
    
    const activeQuests = quests.filter(q => q.status === 'active');

    if (activeQuests.length === 0) return null;

    return (
        <div className={`glass-panel w-52 rounded-xl pointer-events-auto transition-all duration-300 ${collapsed ? 'h-10 overflow-hidden' : ''}`}>
            <div 
                className="p-3 cursor-pointer flex justify-between items-center group"
                onClick={() => setCollapsed(!collapsed)}
            >
                <h3 className="text-accent font-fantasy text-xs uppercase font-bold tracking-[0.2em] group-hover:text-white transition-colors">Journal</h3>
                <span className="text-accent opacity-50">{collapsed ? '↓' : '↑'}</span>
            </div>
            
            {!collapsed && (
                <div className="p-3 space-y-4 max-h-64 overflow-y-auto border-t border-white/5 custom-scrollbar">
                    {activeQuests.map(q => (
                        <div key={q.id} className="border-l border-accent/30 pl-3">
                            <h4 className="font-fantasy text-xs text-white uppercase tracking-wider mb-1">{q.title}</h4>
                            <p className="font-inter text-[10px] text-gray-400 mb-2 leading-relaxed italic">"{q.objective}"</p>
                            <div className="w-full bg-black/40 h-1 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-accent shadow-[0_0_8px_#22d3ee]" 
                                    style={{ width: `${(q.progress / (q.amount || 1)) * 100}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-center text-[8px] mt-1 font-inter uppercase tracking-widest">
                                <span className="text-gray-500">Progress</span>
                                <span className="text-accent">{q.progress} / {q.amount || 1}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
