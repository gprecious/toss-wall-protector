import Phaser from 'phaser';
import { getSaveManager, UpgradeState } from '../systems/SaveManager';

interface UpgradeItem {
  key: keyof UpgradeState;
  label: string;
  description: string;
  baseCost: number;
  costScale: number;
}

const UPGRADES: UpgradeItem[] = [
  { key: 'wallHp', label: '🏰 Wall Fortify', description: 'Wall HP +20', baseCost: 50, costScale: 1.5 },
  { key: 'npcAttack', label: '⚔️ NPC Attack', description: 'NPC damage +15%', baseCost: 80, costScale: 1.6 },
  { key: 'npcHeal', label: '💊 Heal Efficiency', description: 'Heal rate +20%', baseCost: 60, costScale: 1.4 },
  { key: 'collectEfficiency', label: '🌾 Collect Speed', description: 'Resource spawn +10%', baseCost: 70, costScale: 1.5 },
];

export class UpgradeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UpgradeScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    const save = getSaveManager();
    const data = save.get();

    this.add.text(cx, 40, 'Upgrade Shop', {
      fontSize: '32px', color: '#ffcc00', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, 80, `🪙 ${data.coins}`, {
      fontSize: '22px', color: '#ffdd44',
    }).setOrigin(0.5);

    UPGRADES.forEach((upg, i) => {
      const y = 140 + i * 100;
      const level = save.getUpgradeLevel(upg.key);
      const cost = Math.floor(upg.baseCost * Math.pow(upg.costScale, level));

      this.add.text(60, y, upg.label, { fontSize: '20px', color: '#ffffff' });
      this.add.text(60, y + 26, `${upg.description} (Lv.${level})`, { fontSize: '14px', color: '#aaaaaa' });

      const canAfford = data.coins >= cost;
      const btn = this.add.text(width - 80, y + 10, `${cost} 🪙`, {
        fontSize: '18px',
        color: canAfford ? '#44ff44' : '#ff4444',
        backgroundColor: '#333333',
        padding: { x: 12, y: 6 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: canAfford });

      if (canAfford) {
        btn.on('pointerdown', () => {
          if (save.spendCoins(cost)) {
            save.upgradeLevel(upg.key);
            this.scene.restart();
          }
        });
        btn.on('pointerover', () => btn.setColor('#ffffff'));
        btn.on('pointerout', () => btn.setColor('#44ff44'));
      }
    });

    // Back button
    const backBtn = this.add.text(cx, height - 50, '← Back', {
      fontSize: '20px', color: '#aaaaaa',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
    backBtn.on('pointerout', () => backBtn.setColor('#aaaaaa'));
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));
  }
}
