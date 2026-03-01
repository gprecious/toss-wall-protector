import Phaser from 'phaser';
import { getSaveManager } from '../systems/SaveManager';
import { DailyRewardManager } from '../systems/DailyRewardManager';
import { CollectionManager } from '../systems/CollectionManager';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    const save = getSaveManager();
    const data = save.get();

    this.add.text(cx, 80, 'Wall Protector', {
      fontSize: '48px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Stats
    this.add.text(cx, 140, `🪙 ${data.coins}  |  Stage ${data.currentStage}`, {
      fontSize: '18px', color: '#ffdd44',
    }).setOrigin(0.5);

    const { owned, total } = CollectionManager.getOwnedCount();
    this.add.text(cx, 168, `📖 ${owned}/${total} NPCs`, {
      fontSize: '14px', color: '#aaaaaa',
    }).setOrigin(0.5);

    // Buttons
    const buttons: { label: string; y: number; scene: string; data?: object }[] = [
      { label: '▶ Play', y: height / 2 - 20, scene: 'GameScene', data: { stage: data.currentStage } },
      { label: '🛒 Upgrades', y: height / 2 + 40, scene: 'UpgradeScene' },
      { label: '📖 Collection', y: height / 2 + 90, scene: 'CollectionScene' },
    ];

    buttons.forEach(({ label, y, scene, data: sceneData }) => {
      const btn = this.add.text(cx, y, label, {
        fontSize: '24px', color: '#aaaaaa',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      btn.on('pointerover', () => btn.setColor('#ffffff'));
      btn.on('pointerout', () => btn.setColor('#aaaaaa'));
      btn.on('pointerdown', () => this.scene.start(scene, sceneData));
    });

    // Daily reward popup
    DailyRewardManager.showPopup(this);
  }
}
