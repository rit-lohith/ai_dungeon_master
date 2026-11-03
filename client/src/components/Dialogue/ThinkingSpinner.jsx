import React from 'react';

export default function ThinkingSpinner() {
    return (
        <div className="flex items-center space-x-2 p-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="text-accent text-[10px] ml-2 animate-pulse">Thinking...</span>
        </div>
    );
}
