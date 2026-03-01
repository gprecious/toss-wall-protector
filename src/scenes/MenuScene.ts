import Phaser from 'phaser';
import { iapManager, type ProductInfo } from '../toss';
import { leaderboardManager, type LeaderboardEntry } from '../toss';

export class MenuScene extends Phaser.Scene {
  private shopContainer?: Phaser.GameObjects.Container;
  private leaderboardContainer?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2 - 100, 'Wall Protector', {
        fontSize: '48px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Start button
    this.createButton(width / 2, height / 2, 'Start', '#aaaaaa', () => {
      this.scene.start('GameScene', { stage: 0 });
    });

    // Shop button
    this.createButton(width / 2, height / 2 + 60, '🛒 Shop', '#88aaff', () => {
      this.toggleShop();
    });

    // Leaderboard button
    this.createButton(width / 2, height / 2 + 110, '🏆 Leaderboard', '#ffaa44', () => {
      this.toggleLeaderboard();
    });
  }

  private createButton(x: number, y: number, label: string, color: string, onClick: () => void): Phaser.GameObjects.Text {
    const btn = this.add
      .text(x, y, label, { fontSize: '24px', color })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout', () => btn.setColor(color));
    btn.on('pointerdown', onClick);
    return btn;
  }

  private toggleShop(): void {
    if (this.shopContainer) {
      this.shopContainer.destroy();
      this.shopContainer = undefined;
      return;
    }
    if (this.leaderboardContainer) {
      this.leaderboardContainer.destroy();
      this.leaderboardContainer = undefined;
    }

    const { width, height } = this.scale;
    const container = this.add.container(0, 0).setDepth(100);
    this.shopContainer = container;

    // Backdrop
    const bg = this.add.rectangle(width / 2, height / 2, width - 40, height - 80, 0x111111, 0.95)
      .setInteractive();
    container.add(bg);

    container.add(this.add.text(width / 2, 60, '🛒 Shop', {
      fontSize: '28px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5));

    const products = iapManager.getProductCatalog();
    products.forEach((product: ProductInfo, i: number) => {
      const y = 120 + i * 56;
      const owned = iapManager.hasPurchased(product.id);

      container.add(this.add.text(40, y, product.name, {
        fontSize: '18px', color: '#ffffff',
      }));

      container.add(this.add.text(40, y + 22, product.description, {
        fontSize: '12px', color: '#888888',
      }));

      const btnLabel = owned ? '구매완료' : product.priceLabel;
      const btnColor = owned ? '#444444' : '#44aa44';
      const buyBtn = this.add.text(width - 60, y + 10, btnLabel, {
        fontSize: '16px', color: btnColor, backgroundColor: '#222222',
        padding: { x: 10, y: 4 },
      }).setOrigin(1, 0.5);

      if (!owned) {
        buyBtn.setInteractive({ useHandCursor: true });
        buyBtn.on('pointerdown', async () => {
          const result = await iapManager.purchase(product.id);
          if (result.success) {
            buyBtn.setText('구매완료').setColor('#444444').removeInteractive();
          }
        });
      }

      container.add(buyBtn);
    });

    // Restore button
    const restoreBtn = this.add.text(width / 2, height - 80, '구매 복원', {
      fontSize: '16px', color: '#6688cc',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    restoreBtn.on('pointerdown', async () => {
      await iapManager.restorePurchases();
      this.shopContainer?.destroy();
      this.shopContainer = undefined;
      this.toggleShop(); // Refresh
    });
    container.add(restoreBtn);

    // Close button
    const closeBtn = this.add.text(width - 40, 40, '✕', {
      fontSize: '28px', color: '#ff4444',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      container.destroy();
      this.shopContainer = undefined;
    });
    container.add(closeBtn);
  }

  private toggleLeaderboard(): void {
    if (this.leaderboardContainer) {
      this.leaderboardContainer.destroy();
      this.leaderboardContainer = undefined;
      return;
    }
    if (this.shopContainer) {
      this.shopContainer.destroy();
      this.shopContainer = undefined;
    }

    const { width, height } = this.scale;
    const container = this.add.container(0, 0).setDepth(100);
    this.leaderboardContainer = container;

    const bg = this.add.rectangle(width / 2, height / 2, width - 40, height - 80, 0x111111, 0.95)
      .setInteractive();
    container.add(bg);

    container.add(this.add.text(width / 2, 60, '🏆 Leaderboard', {
      fontSize: '28px', color: '#ffaa44', fontStyle: 'bold',
    }).setOrigin(0.5));

    const loadingText = this.add.text(width / 2, height / 2, 'Loading...', {
      fontSize: '18px', color: '#888888',
    }).setOrigin(0.5);
    container.add(loadingText);

    leaderboardManager.getTopScores(10).then((entries: LeaderboardEntry[]) => {
      loadingText.destroy();
      if (entries.length === 0) {
        container.add(this.add.text(width / 2, height / 2, 'No scores yet', {
          fontSize: '18px', color: '#666666',
        }).setOrigin(0.5));
      } else {
        entries.forEach((entry: LeaderboardEntry, i: number) => {
          const y = 110 + i * 36;
          container.add(this.add.text(60, y, `#${entry.rank}`, {
            fontSize: '16px', color: '#ffaa44',
          }));
          container.add(this.add.text(120, y, entry.displayName, {
            fontSize: '16px', color: '#ffffff',
          }));
          container.add(this.add.text(width - 60, y, `${entry.score}`, {
            fontSize: '16px', color: '#88ff88',
          }).setOrigin(1, 0));
        });
      }
    }).catch(() => {
      loadingText.setText('Failed to load');
    });

    const closeBtn = this.add.text(width - 40, 40, '✕', {
      fontSize: '28px', color: '#ff4444',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      container.destroy();
      this.leaderboardContainer = undefined;
    });
    container.add(closeBtn);
  }
}
