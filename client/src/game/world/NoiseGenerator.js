import { createNoise2D } from 'simplex-noise';

class NoiseGenerator {
    constructor() {
        this.noise2D = createNoise2D();
    }
    
    get(x, y) {
        // Map output from [-1, 1] to [0, 1]
        return (this.noise2D(x, y) + 1) / 2;
    }
}

export default NoiseGenerator;
