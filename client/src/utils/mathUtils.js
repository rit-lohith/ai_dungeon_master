export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const distance = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

export const manhattanDistance = (x1, y1, x2, y2) => Math.abs(x2 - x1) + Math.abs(y2 - y1);
