import Phaser from 'phaser';

class AudioService {
    constructor() {
        this.scene = null;
    }
    
    init(scene) {
        this.scene = scene;
    }
    
    playMusic(key) {
        if(!this.scene) return;
        // logic to play bgm
    }
    
    playSound(key) {
        if(!this.scene) return;
        // logic to play sfx
    }
}
export default new AudioService();
