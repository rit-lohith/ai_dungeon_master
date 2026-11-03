import React, { useState } from 'react';

export default function DialogueInput({ onSubmit, disabled }) {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim() && !disabled) {
            onSubmit(inputValue.trim());
            setInputValue('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex mt-3 gap-2">
            <input 
                type="text" 
                autoFocus
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Say something..."
                disabled={disabled}
                className="flex-1 bg-black/50 border border-gray-600 rounded px-3 py-2 text-[10px] focus:outline-none focus:border-accent disabled:opacity-50"
            />
            <button 
                type="submit" 
                disabled={disabled || !inputValue.trim()}
                className="bg-accent/20 hover:bg-accent/40 text-accent border border-accent px-4 py-2 rounded text-[10px] uppercase font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Speak
            </button>
        </form>
    );
}
