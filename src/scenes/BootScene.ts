import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2, 'Loading...', {
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.time.delayedCall(500, () => {
      this.scene.start('MenuScene');
    });
  }
}
