import Phaser from 'phaser';

interface ResultData {
  victory: boolean;
  wallHp: number;
  wallMaxHp: number;
  monstersKilled: number;
  npcsHealed: number;
  stage: number;
}

export class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultScene' });
  }

  create(data: ResultData): void {
    const { width, height } = this.scale;
    const cx = width / 2;

    const title = data.victory ? 'Victory!' : 'Defeated...';
    const color = data.victory ? '#44ff44' : '#ff4444';

    this.add.text(cx, 80, title, {
      fontSize: '48px', color, fontStyle: 'bold',
    }).setOrigin(0.5);

    const stats = [
      `Wall HP: ${data.wallHp} / ${data.wallMaxHp}`,
      `Monsters Killed: ${data.monstersKilled}`,
      `NPCs Healed: ${data.npcsHealed}`,
    ];

    stats.forEach((line, i) => {
      this.add.text(cx, 180 + i * 36, line, {
        fontSize: '20px', color: '#ffffff',
      }).setOrigin(0.5);
    });

    const btnLabel = data.victory ? 'Next Stage' : 'Retry';
    const btn = this.add.text(cx, height - 120, btnLabel, {
      fontSize: '28px', color: '#aaaaaa', backgroundColor: '#333333',
      padding: { x: 24, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout', () => btn.setColor('#aaaaaa'));
    btn.on('pointerdown', () => this.scene.start('GameScene'));

    const menuBtn = this.add.text(cx, height - 60, 'Menu', {
      fontSize: '18px', color: '#888888',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuBtn.on('pointerover', () => menuBtn.setColor('#ffffff'));
    menuBtn.on('pointerout', () => menuBtn.setColor('#888888'));
    menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }
}
