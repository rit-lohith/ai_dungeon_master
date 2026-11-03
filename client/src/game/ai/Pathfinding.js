import PF from 'pathfinding';

export default class Pathfinding {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = new PF.Grid(width, height);
        this.finder = new PF.AStarFinder({
            allowDiagonal: false,
            heuristic: PF.Heuristic.manhattan
        });
        this.cache = new Map();
    }

    updateGrid(mapData) {
        this.grid = new PF.Grid(this.width, this.height);
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (mapData[y][x] !== 0) { // If not floor, it's blocked
                    this.grid.setWalkableAt(x, y, false);
                }
            }
        }
        this.cache.clear();
    }

    setDynamicBlock(x, y, isBlocked) {
        this.grid.setWalkableAt(x, y, !isBlocked);
        this.cache.clear(); // invalidate cache
    }

    findPath(startX, startY, endX, endY) {
        const cacheKey = `${startX},${startY}->${endX},${endY}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const gridClone = this.grid.clone();
        const path = this.finder.findPath(startX, startY, endX, endY, gridClone);
        
        if (path.length > 0) {
            this.cache.set(cacheKey, path);
        }
        
        return path;
    }
}
