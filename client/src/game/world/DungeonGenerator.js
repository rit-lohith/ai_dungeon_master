import RoomBuilder from './RoomBuilder';
import CorridorBuilder from './CorridorBuilder';
import NoiseGenerator from './NoiseGenerator';

export default class DungeonGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.map = Array(height).fill().map(() => Array(width).fill(1)); // 1 = wall, 0 = floor
        this.rooms = [];
    }

    generate(depth = 5) {
        // 1. First, populate the base map with walls and lava rivers
        const noise = new NoiseGenerator();
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const val = noise.get(x / 10, y / 10);
                const riverVal = noise.get(x / 12, y / 12);
                
                // Lava River (Type 6)
                if (riverVal > 0.4 && riverVal < 0.48) {
                    this.map[y][x] = 6;
                } else {
                    // Randomize wall types
                    this.map[y][x] = val > 0.5 ? 2 : 1;
                }
            }
        }

        // 2. Perform BSP split (rooms & corridors)
        const root = { x: 1, y: 1, w: this.width - 2, h: this.height - 2 };
        this.splitRoom(root, depth);
        
        // 3. Find START and END rooms (farthest apart)
        let maxDist = -1;
        let startRoom = this.rooms[0];
        let endRoom = this.rooms[this.rooms.length - 1];

        for (let i = 0; i < this.rooms.length; i++) {
            for (let j = i + 1; j < this.rooms.length; j++) {
                const r1 = this.rooms[i];
                const r2 = this.rooms[j];
                const dist = Math.abs(r1.x - r2.x) + Math.abs(r1.y - r2.y);
                if (dist > maxDist) {
                    maxDist = dist;
                    startRoom = r1;
                    endRoom = r2;
                }
            }
        }

        // Mark entrance/exit
        const sx = Math.max(0, Math.min(this.width - 1, startRoom.x + Math.floor(startRoom.w/2)));
        const sy = Math.max(0, Math.min(this.height - 1, startRoom.y + Math.floor(startRoom.h/2)));
        const ex = Math.max(0, Math.min(this.width - 1, endRoom.x + Math.floor(endRoom.w/2)));
        const ey = Math.max(0, Math.min(this.height - 1, endRoom.y + Math.floor(endRoom.h/2)));
        
        this.map[sy][sx] = 3; // START
        this.map[ey][ex] = 4; // END

        return { 
            grid: this.map, 
            rooms: this.rooms, 
            startPos: { x: sx, y: sy }, 
            endPos: { x: ex, y: ey } 
        };
    }

    splitRoom(rect, iter) {
        if (iter === 0 || (rect.w <= 15 && rect.h <= 15)) {
            // Build actual room
            const room = RoomBuilder.build(rect);
            this.rooms.push(room);
            this.carve(room);
            return room;
        }

        const splitH = Math.random() > 0.5;
        let left, right;
        if (splitH && rect.h > 10) {
            const splitPoint = Math.floor(rect.y + rect.h / 2 + (Math.random() * 4 - 2));
            const r1 = { x: rect.x, y: rect.y, w: rect.w, h: splitPoint - rect.y };
            const r2 = { x: rect.x, y: splitPoint, w: rect.w, h: rect.y + rect.h - splitPoint };
            left = this.splitRoom(r1, iter - 1);
            right = this.splitRoom(r2, iter - 1);
            CorridorBuilder.connectRooms(this.map, left, right);
            return left || right;
        } else if (!splitH && rect.w > 10) {
            const splitPoint = Math.floor(rect.x + rect.w / 2 + (Math.random() * 4 - 2));
            const r1 = { x: rect.x, y: rect.y, w: splitPoint - rect.x, h: rect.h };
            const r2 = { x: splitPoint, y: rect.y, w: rect.x + rect.w - splitPoint, h: rect.h };
            left = this.splitRoom(r1, iter - 1);
            right = this.splitRoom(r2, iter - 1);
            CorridorBuilder.connectRooms(this.map, left, right);
            return left || right;
        } else {
            const room = RoomBuilder.build(rect);
            this.rooms.push(room);
            this.carve(room);
            return room;
        }
    }

    carve(room) {
        for (let y = room.y; y < room.y + room.h; y++) {
            for (let x = room.x; x < room.x + room.w; x++) {
                if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
                    this.map[y][x] = 0;
                }
            }
        }
    }
}
