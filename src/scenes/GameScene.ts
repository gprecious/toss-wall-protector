import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2, 'Game Scene', {
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
  }
}
