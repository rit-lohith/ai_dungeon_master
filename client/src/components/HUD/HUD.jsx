import React from 'react';
import HealthBar from './HealthBar';
import QuestTracker from './QuestTracker';
import MiniMap from './MiniMap';
import ControlsHint from './ControlsHint';

const HUD = () => {
    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20 flex justify-between p-4">
            <div className="w-1/3">
                <HealthBar />
                <div className="mt-4 pointer-events-auto">
                    <QuestTracker />
                </div>
            </div>
            
            <div className="w-1/4 flex justify-end">
                <MiniMap />
            </div>

            {/* Centered Controls Tutorial */}
            <ControlsHint />
        </div>
    );
};
export default HUD;
