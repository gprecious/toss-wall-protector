import Phaser from 'phaser';
import { MonsterType, MONSTER_CONFIG } from '../data/GameConfig';

export class Monster extends Phaser.Physics.Arcade.Sprite {
  public monsterType: MonsterType;
  public hp: number;
  public maxHp: number;
  public dmg: number;
  public moveSpeed: number;
  public atkCooldown: number;
  public lastAtkTime = 0;
  public attacking = false;

  private hpBg: Phaser.GameObjects.Rectangle;
  private hpFill: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene, x: number, y: number, type: MonsterType,
    hpMult = 1, speedMult = 1, dmgMult = 1,
  ) {
    const cfg = MONSTER_CONFIG[type];
    super(scene, x, y, `monster_${type}`);

    this.monsterType = type;
    this.hp = Math.floor(cfg.hp * hpMult);
    this.maxHp = this.hp;
    this.dmg = Math.floor(cfg.damage * dmgMult);
    this.moveSpeed = Math.floor(cfg.speed * speedMult);
    this.atkCooldown = cfg.attackCooldown;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(10);

    const barW = cfg.size;
    this.hpBg = scene.add.rectangle(x, y - cfg.size / 2 - 6, barW, 4, 0x333333).setDepth(11);
    this.hpFill = scene.add.rectangle(x - barW / 2, y - cfg.size / 2 - 6, barW, 4, 0x00ff00)
      .setOrigin(0, 0.5).setDepth(12);

    this.setVelocityX(-this.moveSpeed);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    const barW = this.displayWidth;
    this.hpBg.setPosition(this.x, this.y - this.displayHeight / 2 - 6);
    this.hpFill.setPosition(this.x - barW / 2, this.y - this.displayHeight / 2 - 6);
    this.hpFill.setDisplaySize(barW * (this.hp / this.maxHp), 4);
  }

  hit(amount: number): boolean {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.cleanup();
      this.destroy();
      return true;
    }
    return false;
  }

  canAttack(time: number): boolean {
    return time - this.lastAtkTime >= this.atkCooldown;
  }

  doAttack(time: number): number {
    this.lastAtkTime = time;
    return this.dmg;
  }

  setAttacking(val: boolean): void {
    this.attacking = val;
    this.setVelocityX(val ? 0 : -this.moveSpeed);
  }

  cleanup(): void {
    if (this.hpBg && this.hpBg.active) this.hpBg.destroy();
    if (this.hpFill && this.hpFill.active) this.hpFill.destroy();
    this.hpBg = null as unknown as Phaser.GameObjects.Rectangle;
    this.hpFill = null as unknown as Phaser.GameObjects.Rectangle;
  }

  destroy(fromScene?: boolean): void {
    this.cleanup();
    super.destroy(fromScene);
  }
}
