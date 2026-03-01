import Phaser from 'phaser';
import { ProgressManager } from '../systems/ProgressManager';
import { getSaveManager } from '../systems/SaveManager';

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
    const save = getSaveManager();

    const title = data.victory ? 'Victory!' : 'Defeated...';
    const color = data.victory ? '#44ff44' : '#ff4444';

    this.add.text(cx, 60, title, {
      fontSize: '48px', color, fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, 110, `Stage ${data.stage}`, {
      fontSize: '20px', color: '#aaaaaa',
    }).setOrigin(0.5);

    // Coin reward
    let coinReward = 0;
    if (data.victory) {
      const stageCfg = ProgressManager.getStageConfig(data.stage);
      coinReward = stageCfg.coinReward;
      save.addCoins(coinReward);
      save.setCurrentStage(data.stage + 1);
    } else {
      coinReward = Math.floor(data.monstersKilled * 2);
      if (coinReward > 0) save.addCoins(coinReward);
    }
    save.addStats(data.monstersKilled, data.npcsHealed);

    const stats = [
      `Wall HP: ${data.wallHp} / ${data.wallMaxHp}`,
      `Monsters Killed: ${data.monstersKilled}`,
      `NPCs Healed: ${data.npcsHealed}`,
      ``,
      `🪙 +${coinReward} coins`,
      `Total: ${save.get().coins} coins`,
    ];

    stats.forEach((line, i) => {
      this.add.text(cx, 160 + i * 32, line, {
        fontSize: '18px', color: '#ffffff',
      }).setOrigin(0.5);
    });

    // Buttons
    const btnLabel = data.victory ? 'Next Stage' : 'Retry';
    const btn = this.add.text(cx, height - 140, btnLabel, {
      fontSize: '28px', color: '#aaaaaa', backgroundColor: '#333333',
      padding: { x: 24, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout', () => btn.setColor('#aaaaaa'));
    btn.on('pointerdown', () => {
      const nextStage = data.victory ? data.stage + 1 : data.stage;
      this.scene.start('GameScene', { stage: nextStage });
    });

    const upgradeBtn = this.add.text(cx, height - 80, '🛒 Upgrades', {
      fontSize: '20px', color: '#ffcc00',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    upgradeBtn.on('pointerover', () => upgradeBtn.setColor('#ffffff'));
    upgradeBtn.on('pointerout', () => upgradeBtn.setColor('#ffcc00'));
    upgradeBtn.on('pointerdown', () => this.scene.start('UpgradeScene'));

    const menuBtn = this.add.text(cx, height - 40, 'Menu', {
      fontSize: '18px', color: '#888888',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menuBtn.on('pointerover', () => menuBtn.setColor('#ffffff'));
    menuBtn.on('pointerout', () => menuBtn.setColor('#888888'));
    menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }
}
