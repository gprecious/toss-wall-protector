import Phaser from 'phaser';
import { adManager, shareManager, leaderboardManager } from '../toss';

interface ResultData {
  victory: boolean;
  wallHp: number;
  wallMaxHp: number;
  monstersKilled: number;
  npcsHealed: number;
  stage: number;
}

export class ResultScene extends Phaser.Scene {
  private usedRevive = false;

  constructor() {
    super({ key: 'ResultScene' });
  }

  create(data: ResultData): void {
    this.usedRevive = false;
    const { width, height } = this.scale;
    const cx = width / 2;

    const title = data.victory ? 'Victory!' : 'Defeated...';
    const color = data.victory ? '#44ff44' : '#ff4444';

    this.add.text(cx, 60, title, {
      fontSize: '48px', color, fontStyle: 'bold',
    }).setOrigin(0.5);

    const score = data.monstersKilled * 100 + data.npcsHealed * 50;

    const stats = [
      `Stage: \${data.stage + 1}`,
      `Wall HP: \${data.wallHp} / \${data.wallMaxHp}`,
      `Monsters Killed: \${data.monstersKilled}`,
      `NPCs Healed: \${data.npcsHealed}`,
      `Score: \${score}`,
    ];

    stats.forEach((line, i) => {
      this.add.text(cx, 140 + i * 32, line, {
        fontSize: '18px', color: '#ffffff',
      }).setOrigin(0.5);
    });

    // Submit score to leaderboard
    leaderboardManager.submitScore(data.stage, score).catch(() => {});

    let btnY = height - 200;

    if (data.victory && adManager.canShowRewarded()) {
      // Double reward button
      const rewardBtn = this.add.text(cx, btnY, '🎬 보상 2배 (광고)', {
        fontSize: '22px', color: '#ffdd44', backgroundColor: '#333333',
        padding: { x: 20, y: 10 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      rewardBtn.on('pointerover', () => rewardBtn.setColor('#ffffff'));
      rewardBtn.on('pointerout', () => rewardBtn.setColor('#ffdd44'));
      rewardBtn.on('pointerdown', async () => {
        rewardBtn.removeInteractive().setColor('#666666').setText('Loading...');
        const rewarded = await adManager.showRewardedAd();
        if (rewarded) {
          rewardBtn.setText('✅ 보상 2배 획득!').setColor('#44ff44');
          // TODO: Actually double rewards via game state
        } else {
          rewardBtn.setText('❌ 광고 실패').setColor('#ff4444');
        }
      });
      btnY += 50;
    }

    if (!data.victory && adManager.canShowRewarded() && !this.usedRevive) {
      // Revive button
      const reviveBtn = this.add.text(cx, btnY, '🎬 부활 (광고)', {
        fontSize: '22px', color: '#44ddff', backgroundColor: '#333333',
        padding: { x: 20, y: 10 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      reviveBtn.on('pointerover', () => reviveBtn.setColor('#ffffff'));
      reviveBtn.on('pointerout', () => reviveBtn.setColor('#44ddff'));
      reviveBtn.on('pointerdown', async () => {
        reviveBtn.removeInteractive().setColor('#666666').setText('Loading...');
        const rewarded = await adManager.showRewardedAd();
        if (rewarded) {
          this.usedRevive = true;
          // Restart same stage with revive flag
          this.scene.start('GameScene', { stage: data.stage, revive: true });
        } else {
          reviveBtn.setText('❌ 광고 실패').setColor('#ff4444');
        }
      });
      btnY += 50;
    }

    // Share button
    const shareBtn = this.add.text(cx, btnY, '📤 공유하기', {
      fontSize: '18px', color: '#88aaff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    shareBtn.on('pointerdown', async () => {
      await shareManager.shareScore(data.stage, score);
      shareBtn.setText('✅ 공유 완료!');
    });
    btnY += 44;

    // Next/Retry button
    const btnLabel = data.victory ? 'Next Stage' : 'Retry';
    const nextBtn = this.add.text(cx, btnY, btnLabel, {
      fontSize: '28px', color: '#aaaaaa', backgroundColor: '#333333',
      padding: { x: 24, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    nextBtn.on('pointerover', () => nextBtn.setColor('#ffffff'));
    nextBtn.on('pointerout', () => nextBtn.setColor('#aaaaaa'));
    nextBtn.on('pointerdown', () => {
      const nextStage = data.victory ? data.stage + 1 : data.stage;
      this.scene.start('GameScene', { stage: nextStage });
    });

    // Menu button
    const menuBtn = this.add.text(cx, btnY + 60, 'Menu', {
      fontSize: '18px', color: '#888888',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuBtn.on('pointerover', () => menuBtn.setColor('#ffffff'));
    menuBtn.on('pointerout', () => menuBtn.setColor('#888888'));
    menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    // Preload next ad
    adManager.loadRewardedAd().catch(() => {});
  }
}
