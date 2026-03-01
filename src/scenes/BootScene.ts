import Phaser from 'phaser';
import { MonsterType, MONSTER_CONFIG, NPCType, NPC_CONFIG, ResourceType, RESOURCE_CONFIG } from '../data/GameConfig';
import { initSDK } from '../toss';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    this.generateTextures();
    initSDK();

    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2, 'Loading...', { fontSize: '32px', color: '#ffffff' })
      .setOrigin(0.5);

    this.time.delayedCall(300, () => {
      this.scene.start('MenuScene');
    });
  }

  private generateTextures(): void {
    const g = this.add.graphics();

    for (const type of Object.values(MonsterType)) {
      const cfg = MONSTER_CONFIG[type];
      g.clear();
      g.fillStyle(cfg.color);
      g.fillRect(0, 0, cfg.size, cfg.size);
      g.generateTexture(`monster_\${type}`, cfg.size, cfg.size);
    }

    for (const type of Object.values(NPCType)) {
      const cfg = NPC_CONFIG[type];
      g.clear();
      g.fillStyle(cfg.color);
      g.fillRect(0, 0, 26, 26);
      g.generateTexture(`npc_\${type}`, 26, 26);
    }

    g.clear();
    g.fillStyle(0x888888);
    g.fillRect(0, 0, 26, 26);
    g.generateTexture('npc_injured', 26, 26);

    for (const type of Object.values(ResourceType)) {
      const cfg = RESOURCE_CONFIG[type];
      g.clear();
      g.fillStyle(cfg.color);
      g.fillRect(0, 0, 20, 20);
      g.generateTexture(`resource_\${type}`, 20, 20);
    }

    g.clear();
    g.fillStyle(0xffff00);
    g.fillRect(0, 0, 10, 4);
    g.generateTexture('projectile', 10, 4);

    g.destroy();
  }
}
