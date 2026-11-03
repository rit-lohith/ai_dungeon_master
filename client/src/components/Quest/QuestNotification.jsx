import React from 'react';

export default function QuestNotification({ quest }) {
    return (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-accent text-black font-bold p-3 rounded shadow-xl animate-fade-in pointer-events-none z-50 text-center">
            <span className="text-[10px] uppercase opacity-75">Quest Accepted</span>
            <div className="text-sm">{quest.title}</div>
        </div>
    );
}
