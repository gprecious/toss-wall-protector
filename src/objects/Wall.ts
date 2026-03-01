import Phaser from 'phaser';
import { WALL_CONFIG } from '../data/GameConfig';

export class Wall {
  private body: Phaser.GameObjects.Rectangle;
  private hpBarBg: Phaser.GameObjects.Rectangle;
  private hpBarFill: Phaser.GameObjects.Rectangle;
  private hpText: Phaser.GameObjects.Text;

  public hp: number;
  public maxHp: number;
  public readonly x: number;
  public readonly wallWidth: number;

  constructor(scene: Phaser.Scene) {
    this.hp = WALL_CONFIG.maxHp;
    this.maxHp = WALL_CONFIG.maxHp;
    this.x = WALL_CONFIG.x;
    this.wallWidth = WALL_CONFIG.width;

    const h = scene.scale.height;

    this.body = scene.add.rectangle(this.x + this.wallWidth / 2, h / 2, this.wallWidth, h, WALL_CONFIG.color);
    this.body.setDepth(5);

    const barW = 120;
    const barX = this.x + this.wallWidth / 2;
    const barY = 16;
    this.hpBarBg = scene.add.rectangle(barX, barY, barW, 12, 0x333333).setDepth(20);
    this.hpBarFill = scene.add.rectangle(barX - barW / 2, barY, barW, 12, 0x00cc00).setOrigin(0, 0.5).setDepth(21);
    this.hpText = scene.add.text(barX, barY, `${this.hp}/${this.maxHp}`, {
      fontSize: '10px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(22);
  }

  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
    this.updateBar();
  }

  repair(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    this.updateBar();
  }

  isDestroyed(): boolean {
    return this.hp <= 0;
  }

  getRightEdge(): number {
    return this.x + this.wallWidth;
  }

  private updateBar(): void {
    const ratio = this.hp / this.maxHp;
    this.hpBarFill.setDisplaySize(120 * ratio, 12);
    this.hpText.setText(`${Math.ceil(this.hp)}/${this.maxHp}`);
    if (ratio > 0.5) this.hpBarFill.setFillStyle(0x00cc00);
    else if (ratio > 0.25) this.hpBarFill.setFillStyle(0xcccc00);
    else this.hpBarFill.setFillStyle(0xcc0000);
  }

  destroy(): void {
    this.body.destroy();
    this.hpBarBg.destroy();
    this.hpBarFill.destroy();
    this.hpText.destroy();
  }
}
