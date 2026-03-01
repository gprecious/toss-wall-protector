import Phaser from 'phaser';
import { getSaveManager } from './SaveManager';

export class DailyRewardManager {
  static canClaim(): boolean {
    const dr = getSaveManager().getDailyReward();
    const today = new Date().toISOString().split('T')[0];
    return dr.lastClaimDate !== today;
  }

  static showPopup(scene: Phaser.Scene, onClose?: () => void): void {
    if (!DailyRewardManager.canClaim()) {
      if (onClose) onClose();
      return;
    }

    const { width, height } = scene.scale;
    const cx = width / 2;
    const cy = height / 2;

    // Overlay
    const overlay = scene.add.rectangle(cx, cy, width, height, 0x000000, 0.7).setDepth(100);

    // Panel
    const panel = scene.add.rectangle(cx, cy, 340, 280, 0x222244, 1).setDepth(101).setStrokeStyle(2, 0xffcc00);

    const save = getSaveManager();
    const dr = save.getDailyReward();
    const streak = dr.lastClaimDate === new Date(Date.now() - 86400000).toISOString().split('T')[0]
      ? (dr.streak % 7) + 1 : 1;

    const title = scene.add.text(cx, cy - 100, '🎁 Daily Reward!', {
      fontSize: '24px', color: '#ffcc00', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(102);

    const streakText = scene.add.text(cx, cy - 60, `Day ${streak} / 7`, {
      fontSize: '16px', color: '#aaaaaa',
    }).setOrigin(0.5).setDepth(102);

    const coins = 50 + (streak - 1) * 25;
    const bonusText = streak === 7 ? '\n+ 🌟 Rare NPC!' : '';
    const rewardText = scene.add.text(cx, cy - 10, `🪙 ${coins} coins${bonusText}`, {
      fontSize: '20px', color: '#ffffff', align: 'center',
    }).setOrigin(0.5).setDepth(102);

    const claimBtn = scene.add.text(cx, cy + 60, 'Claim!', {
      fontSize: '24px', color: '#44ff44', backgroundColor: '#335533',
      padding: { x: 30, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(102);

    claimBtn.on('pointerover', () => claimBtn.setColor('#ffffff'));
    claimBtn.on('pointerout', () => claimBtn.setColor('#44ff44'));
    claimBtn.on('pointerdown', () => {
      const result = save.claimDailyReward();
      // Destroy popup
      [overlay, panel, title, streakText, rewardText, claimBtn].forEach(o => o.destroy());

      // Show claimed message briefly
      const msg = scene.add.text(cx, cy, `+${result.coins} 🪙${result.rareNpc ? '\n+ Rare NPC!' : ''}`, {
        fontSize: '28px', color: '#ffcc00', fontStyle: 'bold', align: 'center',
      }).setOrigin(0.5).setDepth(102);

      scene.time.delayedCall(1500, () => {
        msg.destroy();
        if (onClose) onClose();
      });
    });
  }
}
