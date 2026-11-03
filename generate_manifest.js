const fs = require('fs');
const path = require('path');

const spritesDir = path.join(__dirname, 'client/public/assets/sprites/hero');
const outputFile = path.join(__dirname, 'client/src/game/data/heroAnimations.json');

const data = {};

const dirs = fs.readdirSync(spritesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

for (const dir of dirs) {
    const fullPath = path.join(spritesDir, dir);
    const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.png')).sort();
    
    // Convert to relative URL from public folder
    data[dir] = files.map(f => `assets/sprites/hero/${dir}/${f}`);
}

fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
console.log('Manifest generated at', outputFile);
