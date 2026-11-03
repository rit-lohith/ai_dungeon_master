import React from 'react';
import GameCanvas from './game/GameCanvas';

// Will eventually import HUD and Menus
function App() {
  return (
    <div className="w-screen h-screen relative bg-black select-none">
      <GameCanvas />
      {/* UI Overlay will go here later */}
    </div>
  );
}

export default App;
