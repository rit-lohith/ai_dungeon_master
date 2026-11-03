import Phaser from 'phaser';
import { TILE_SIZE } from '../../utils/constants';

export default class TileMap {
    constructor(scene, width, height, mapData) {
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.mapData = mapData;
        this.tiles = [];
        
        this.draw();
    }

    draw() {
        // Clear previous tiles if any
        this.tiles.forEach(t => t.destroy());
        this.tiles = [];

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.mapData[y][x];
                
                // LAYER 0: Deep Void (Transparent for Live Volcano)
                // Static black fill removed to expose the churning magma background

                // Add "Perfection Separation" Shadow (Offset Drop shadow)
                if (tile !== 6 && tile !== -1) { // If it's a solid structure (Room or Bridge)
                    const shadow = this.scene.add.rectangle(x * TILE_SIZE + 4, y * TILE_SIZE + 4, TILE_SIZE, TILE_SIZE, 0x000000);
                    shadow.setOrigin(0).setAlpha(0.6).setDepth(-9);
                    this.tiles.push(shadow);
                }

                // Add "Soul Depth" Glow for bridges
                if (tile === 7 || tile === 8) {
                    const glow = this.scene.add.rectangle(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE, 0x112233);
                    glow.setOrigin(0).setAlpha(0.4).setDepth(-8);
                    this.tiles.push(glow);
                }

                // LAYER 1: Mystic Aqua Rivers (Type 6)
                if (tile === 6) {
                    const frame = this.getRiverFrame(x, y);
                    const water = this.scene.add.sprite(x * TILE_SIZE, y * TILE_SIZE, 'mystic_paths', frame);
                    water.setOrigin(0).setDisplaySize(TILE_SIZE, TILE_SIZE).setDepth(-5);
                    this.tiles.push(water);
                }

                // LAYER 3: Modular Stone Bridge Paths (Type 7) - CANONICAL ASSEMBLY
                if (tile === 7) {
                    const frames = this.getRoadFramesPerfect(x, y);
                    frames.forEach((f, i) => {
                        const offsetX = (i % 2) * 16;
                        const offsetY = Math.floor(i / 2) * 16;
                        const part = this.scene.add.image(x * TILE_SIZE + offsetX, y * TILE_SIZE + offsetY, 'path_bridges', f);
                        part.setOrigin(0).setDepth(-4);
                        this.tiles.push(part);
                    });
                }

                // LAYER 2: Architectural Bridges (Type 8)
                if (tile === 8) {
                    const frames = [30, 31, 44, 45]; // Horizontal Stone Segment from Bridges_01
                    frames.forEach((f, i) => {
                        const offsetX = (i % 2) * 16;
                        const offsetY = Math.floor(i / 2) * 16;
                        const part = this.scene.add.image(x * TILE_SIZE + offsetX, y * TILE_SIZE + offsetY, 'path_bridges', f);
                        part.setOrigin(0).setDepth(-3);
                        this.tiles.push(part);
                    });
                }

                // LAYER 4: Interior Floors (Type 0, 3, 4, 5)
                if (tile === 0 || tile === 3 || tile === 4 || tile === 5) {
                    const frame = (x + y) % 2 === 0 ? 5 : 6;
                    const floor = this.scene.add.image(x * TILE_SIZE, y * TILE_SIZE, 'walls_floor', frame);
                    floor.setOrigin(0).setDisplaySize(TILE_SIZE, TILE_SIZE).setDepth(-3);
                    this.tiles.push(floor);
                }

                // LAYER 5: Walls and Landmarks
                if (tile === 1 || tile === 2) {
                    let frame = 11;
                    const tileBelow = (y < this.height - 1) ? this.mapData[y+1][x] : 1;
                    const isWalkableBelow = (tileBelow === 0 || tileBelow === 3 || tileBelow === 4 || tileBelow === 7 || tileBelow === 8);
                    
                    if (isWalkableBelow) frame = 0; 
                    
                    const wall = this.scene.add.image(x * TILE_SIZE, y * TILE_SIZE, 'walls_floor', frame);
                    wall.setOrigin(0).setDisplaySize(TILE_SIZE, TILE_SIZE);
                    this.tiles.push(wall);
                } else if (tile === 3) {
                    this.tiles.push(this.scene.add.sprite(x * TILE_SIZE, y * TILE_SIZE, 'walls_floor', 15).setOrigin(0).setDisplaySize(TILE_SIZE, TILE_SIZE));
                } else if (tile === 4) {
                    this.tiles.push(this.scene.add.sprite(x * TILE_SIZE, y * TILE_SIZE, 'walls_floor', 23).setOrigin(0).setDisplaySize(TILE_SIZE, TILE_SIZE).setTint(0x00ffff));
                } else if (tile === 5) {
                    // Unique Spooky Environmental Objects
                    const keys = ['obj_black_crystal','obj_blue_crystal','obj_green_crystal','obj_red_crystal','obj_yellow_crystal','obj_blue_ruins','obj_brown_ruins','obj_water_ruins','obj_white_ruins','obj_yellow_ruins', 'devil_statue', 'devil_altar', 'spider_stones'];
                    const index = (x * 17 + y * 13) % keys.length;
                    const key = keys[index];
                    
                    if (key === 'devil_altar') {
                         this.tiles.push(this.scene.add.sprite(x * TILE_SIZE + 16, y * TILE_SIZE + 16, 'spooky_objects', 1).setDisplaySize(64, 64).setOrigin(0.5).setTint(0xccffff).setDepth(1));
                    } else if (key === 'spider_stones') {
                         this.tiles.push(this.scene.add.sprite(x * TILE_SIZE + 16, y * TILE_SIZE + 16, 'spooky_objects', 2).setDisplaySize(32, 32).setOrigin(0.5).setTint(0xccffff));
                    } else if (key === 'devil_statue') {
                         this.tiles.push(this.scene.add.sprite(x * TILE_SIZE + 16, y * TILE_SIZE + 16, 'spooky_objects', 0).setDisplaySize(32, 32).setOrigin(0.5).setTint(0xccffff));
                    } else {
                        const obj = this.scene.add.sprite(x * TILE_SIZE + TILE_SIZE/2, y * TILE_SIZE + TILE_SIZE/2, key);
                        const size = key.includes('ruins') ? 48 : 32;
                        obj.setDisplaySize(size, size).setOrigin(0.5).setTint(0xcaffff);
                        this.tiles.push(obj);
                    }
                }

                // LAYER 6: Decorations
                if (tile === 7 || tile === 0) {
                    if ((x * 23 + y * 29) % 100 < 5) {
                        const decorId = ((x * 7 + y * 11) % 7) + 1;
                        const decor = this.scene.add.image(x * TILE_SIZE + 16, y * TILE_SIZE + 16, `decor_${decorId}`);
                        decor.setAlpha(0.5).setRotation(Math.random()).setDisplaySize(16, 16);
                        this.tiles.push(decor);
                    }
                }
            }
        }
    }

    getRoadFramesPerfect(x, y) {
        let mask = 0;
        if (y > 0 && (this.mapData[y-1][x] === 7 || this.mapData[y-1][x] === 8)) mask += 1;
        if (y < this.height-1 && (this.mapData[y+1][x] === 7 || this.mapData[y+1][x] === 8)) mask += 2;
        if (x < this.width-1 && (this.mapData[y][x+1] === 7 || this.mapData[y][x+1] === 8)) mask += 4;
        if (x > 0 && (this.mapData[y][x-1] === 7 || this.mapData[y][x-1] === 8)) mask += 8;

        const COLS = 41; 
        
        // Canonical Orange Stone Bridge in Bridges.png (41-column Master set)
        switch(mask) {
            case 1: case 2: case 3: // Vertical (2x2 cluster)
                const vBase = 16 * COLS + 39; // Orange vertical segments
                return [vBase, vBase+1, vBase+COLS, vBase+COLS+1]; 
            case 4: case 8: case 12: // Horizontal (2x2 cluster)
                const hBase = 1 * COLS + 33; // Orange floor center
                return [hBase, hBase+1, hBase+COLS, hBase+COLS+1]; 
            default: return [41+33, 41+34, 82+33, 82+34]; // Default Orange floor
        }
    }

    getRiverFrame(x, y) {
        let mask = 0;
        if (y > 0 && (this.mapData[y-1][x] === 6 || this.mapData[y-1][x] === 8)) mask += 1;
        if (y < this.height-1 && (this.mapData[y+1][x] === 6 || this.mapData[y+1][x] === 8)) mask += 2;
        if (x < this.width-1 && (this.mapData[y][x+1] === 6 || this.mapData[y][x+1] === 8)) mask += 4;
        if (x > 0 && (this.mapData[y][x-1] === 6 || this.mapData[y][x-1] === 8)) mask += 8;

        switch(mask) {
            case 1: case 2: case 3: return 0; // Vertical
            case 4: case 8: case 12: return 1; // Horizontal
            case 6: return 2; 
            case 10: return 3;
            case 5: return 4;
            case 9: return 5;
            default: return (mask & 3) ? 0 : 1;
        }
    }

    isWalkable(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
        const tile = this.mapData[y][x];
        return tile === 0 || tile === 3 || tile === 4 || tile === 7 || tile === 8;
    }
}
