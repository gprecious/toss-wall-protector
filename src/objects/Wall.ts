import Phaser from 'phaser';

export class Wall {
  private scene: Phaser.Scene;
  private wallGraphics: Phaser.GameObjects.Rectangle;
  private hpBar: Phaser.GameObjects.Rectangle;
  private hpBarBg: Phaser.GameObjects.Rectangle;
  private hpText: Phaser.GameObjects.Text;
  private _maxHp: number;
  private _hp: number;
  private wallY: number;

  constructor(scene: Phaser.Scene, maxHp = 100) {
    this.scene = scene;
    this._maxHp = maxHp;
    this._hp = maxHp;

    const { width, height } = scene.scale;
    this.wallY = height * 0.65;

    // Wall visual — horizontal bar across the screen
    this.wallGraphics = scene.add.rectangle(width / 2, this.wallY, width - 40, 16, 0x996633)
      .setDepth(200);

    // HP bar background
    const barWidth = 160;
    const barX = width / 2;
    const barY = this.wallY + 20;
    this.hpBarBg = scene.add.rectangle(barX, barY, barWidth, 10, 0x333333)
      .setDepth(200);
    this.hpBar = scene.add.rectangle(barX, barY, barWidth, 10, 0x44cc44)
      .setDepth(201);

    // HP text
    this.hpText = scene.add.text(barX, barY + 14, '', {
      fontSize: '12px', color: '#ffffff',
    }).setOrigin(0.5, 0).setDepth(201);

    this.updateUI();
  }

  get hp() { return this._hp; }
  get maxHp() { return this._maxHp; }
  get y() { return this.wallY; }

  takeDamage(amount: number) {
    this._hp = Math.max(0, this._hp - amount);
    this.updateUI();

    // Flash red
    this.scene.tweens.add({
      targets: this.wallGraphics,
      fillColor: { from: 0xff4444, to: 0x996633 },
      duration: 300,
    });
  }

  repair(amount: number) {
    this._hp = Math.min(this._maxHp, this._hp + amount);
    this.updateUI();
  }

  isDestroyed(): boolean {
    return this._hp <= 0;
  }

  private updateUI() {
    const ratio = this._hp / this._maxHp;
    const barWidth = 160;
    this.hpBar.width = barWidth * ratio;
    this.hpBar.x = this.hpBarBg.x - (barWidth * (1 - ratio)) / 2;

    // Color based on HP
    if (ratio > 0.5) this.hpBar.setFillStyle(0x44cc44);
    else if (ratio > 0.25) this.hpBar.setFillStyle(0xcccc44);
    else this.hpBar.setFillStyle(0xcc4444);

    this.hpText.setText(`성벽 HP: ${this._hp}/${this._maxHp}`);
  }

  destroy() {
    this.wallGraphics.destroy();
    this.hpBar.destroy();
    this.hpBarBg.destroy();
    this.hpText.destroy();
  }
}
