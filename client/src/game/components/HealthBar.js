import Phaser from 'phaser';

export default class HealthBar {
    constructor(scene, x, y, width = 30, height = 4) {
        this.scene = scene;
        this.bar = this.scene.add.graphics();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.value = 100;
        this.p = (width - 2) / 100;

        // Start hidden
        this.bar.alpha = 0;
        
        this.draw();
    }

    setPercent(percent) {
        this.value = Math.max(0, percent);
        this.draw();
        
        // Show the bar when health changes
        this.show();
    }

    show() {
        this.bar.alpha = 1;
        if (this.hideTimer) this.hideTimer.remove();
        
        this.hideTimer = this.scene.time.delayedCall(3000, () => {
            this.scene.tweens.add({
                targets: this.bar,
                alpha: 0,
                duration: 500
            });
        });
    }

    updatePosition(x, y) {
        this.x = x - this.width / 2;
        this.y = y;
        this.draw();
    }

    draw() {
        this.bar.clear();

        // Background
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(this.x, this.y, this.width, this.height);

        // Health
        this.bar.fillStyle(0xffffff);
        this.bar.fillRect(this.x + 1, this.y + 1, this.width - 2, this.height - 2);

        if (this.value < 30) {
            this.bar.fillStyle(0xff0000);
        } else {
            this.bar.fillStyle(0x00ff00);
        }

        const d = Math.floor(this.p * this.value);
        this.bar.fillRect(this.x + 1, this.y + 1, d, this.height - 2);
    }

    destroy() {
        this.bar.destroy();
    }
}
