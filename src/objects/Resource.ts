import Phaser from 'phaser';
import { ResourceType, RESOURCE_CONFIG } from '../data/GameConfig';

export class Resource {
  public readonly type: ResourceType;
  public readonly sprite: Phaser.GameObjects.Sprite;
  private label: Phaser.GameObjects.Text;
  private collected = false;

  constructor(scene: Phaser.Scene, x: number, y: number, type: ResourceType) {
    this.type = type;
    const cfg = RESOURCE_CONFIG[type];

    this.sprite = scene.add.sprite(x, y, `resource_${type}`);
    this.sprite.setInteractive({ useHandCursor: true });
    this.sprite.setDepth(10);

    this.label = scene.add.text(x, y + 16, cfg.label, {
      fontSize: '10px', color: '#ffffff', backgroundColor: '#00000088',
    }).setOrigin(0.5).setDepth(11);

    this.sprite.setData('resource', this);
  }

  collect(scene: Phaser.Scene): boolean {
    if (this.collected) return false;
    this.collected = true;

    scene.tweens.add({
      targets: [this.sprite, this.label],
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 200,
      onComplete: () => this.destroy(),
    });
    return true;
  }

  isCollected(): boolean {
    return this.collected;
  }

  destroy(): void {
    this.sprite.destroy();
    this.label.destroy();
  }
}
