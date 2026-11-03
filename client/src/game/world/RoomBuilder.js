class RoomBuilder {
    static build(rect) {
        // Shave off edges so rooms don't overlap completely
        const paddingLeft = Math.floor(Math.random() * 2) + 1;
        const paddingTop = Math.floor(Math.random() * 2) + 1;
        const paddingRight = Math.floor(Math.random() * 2) + 1;
        const paddingBottom = Math.floor(Math.random() * 2) + 1;
        
        // Calculate max allowed dimensions that fit within the rect
        const maxWidth = rect.w - paddingLeft - paddingRight;
        const maxHeight = rect.h - paddingTop - paddingBottom;
        
        return {
            x: rect.x + paddingLeft,
            y: rect.y + paddingTop,
            w: Math.max(3, maxWidth),
            h: Math.max(3, maxHeight)
        };
    }
}

export default RoomBuilder;
