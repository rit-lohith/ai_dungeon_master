import { TILE_SIZE } from './constants';

export const toGrid = (pixel) => Math.floor(pixel / TILE_SIZE);
export const toPixel = (grid) => grid * TILE_SIZE;
export const toPixelCenter = (grid) => (grid * TILE_SIZE) + (TILE_SIZE / 2);
