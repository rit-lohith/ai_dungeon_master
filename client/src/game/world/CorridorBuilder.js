class CorridorBuilder {
    static connectRooms(map, r1, r2) {
        if (!r1 || !r2) return;
        const x1 = Math.floor(r1.x + r1.w / 2);
        const y1 = Math.floor(r1.y + r1.h / 2);
        const x2 = Math.floor(r2.x + r2.w / 2);
        const y2 = Math.floor(r2.y + r2.h / 2);

        const carve = (x, y) => {
            if (map[y] && map[y][x] !== undefined) {
                // If carving over Lava (6), it becomes a Bridge (8)
                if (map[y][x] === 6) {
                    map[y][x] = 8;
                } else if (map[y][x] === 1 || map[y][x] === 2) {
                    // Only overwrite walls with Roads (7)
                    map[y][x] = 7;
                }
            }
        };

        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
            carve(x, y1);
            carve(x, y1 + 1);
        }
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
            carve(x2, y);
            carve(x2 + 1, y);
        }
    }

}

export default CorridorBuilder;
