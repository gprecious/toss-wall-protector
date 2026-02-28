import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2 - 60, 'Wall Protector', {
        fontSize: '48px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const startText = this.add
      .text(width / 2, height / 2 + 40, 'Start', {
        fontSize: '28px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    startText.on('pointerover', () => startText.setColor('#ffffff'));
    startText.on('pointerout', () => startText.setColor('#aaaaaa'));
    startText.on('pointerdown', () => this.scene.start('GameScene'));
  }
}
