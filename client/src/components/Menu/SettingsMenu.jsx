import React from 'react';

export default function SettingsMenu() {
    return (
        <div className="absolute inset-0 bg-black/90 flex justify-center items-center z-50 pointer-events-auto">
            <div className="bg-panelBg p-6 border-2 border-gray-600 rounded">
                <h2 className="text-xl text-white mb-4">Settings</h2>
                <div className="text-sm text-gray-400">Settings not fully implemented yet...</div>
                <button className="mt-4 bg-gray-700 p-2 text-white rounded w-full">Close</button>
            </div>
        </div>
    );
}
