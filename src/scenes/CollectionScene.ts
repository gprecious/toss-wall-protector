import Phaser from 'phaser';
import { CollectionManager } from '../systems/CollectionManager';

export class CollectionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CollectionScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;

    const { owned, total } = CollectionManager.getOwnedCount();

    this.add.text(cx, 40, 'NPC Collection', {
      fontSize: '32px', color: '#ffcc00', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, 78, `${owned} / ${total} discovered`, {
      fontSize: '16px', color: '#aaaaaa',
    }).setOrigin(0.5);

    const entries = CollectionManager.getAllEntries();
    const cols = 3;
    const cellW = 180;
    const cellH = 60;
    const startX = cx - ((cols - 1) * cellW) / 2;
    const startY = 120;

    entries.forEach((entry, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * cellW;
      const y = startY + row * cellH;

      const bgColor = entry.owned ? 0x334433 : 0x222222;
      this.add.rectangle(x, y + 20, cellW - 10, cellH - 8, bgColor).setOrigin(0.5);

      if (entry.owned) {
        this.add.text(x, y + 12, entry.label, {
          fontSize: '14px', color: `#${entry.color.toString(16).padStart(6, '0')}`,
        }).setOrigin(0.5);
        this.add.text(x, y + 30, '✓', { fontSize: '12px', color: '#44ff44' }).setOrigin(0.5);
      } else {
        this.add.text(x, y + 20, '???', {
          fontSize: '16px', color: '#555555',
        }).setOrigin(0.5);
      }
    });

    const backBtn = this.add.text(cx, height - 50, '← Back', {
      fontSize: '20px', color: '#aaaaaa',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
    backBtn.on('pointerout', () => backBtn.setColor('#aaaaaa'));
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }
}
