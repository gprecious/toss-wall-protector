import Phaser from 'phaser';

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  public dmg: number;

  constructor(scene: Phaser.Scene, x: number, y: number, targetX: number, targetY: number, damage: number) {
    super(scene, x, y, 'projectile');
    this.dmg = damage;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(10);

    const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
    const speed = 400;
    this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    this.setRotation(angle);

    scene.time.delayedCall(3000, () => {
      if (this.active) this.destroy();
    });
  }
}
