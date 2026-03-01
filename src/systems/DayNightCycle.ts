import { Phase, DAY_DURATION, NIGHT_MAX_DURATION } from '../data/GameConfig';

export class DayNightCycle {
  private scene: Phaser.Scene;
  private phase: Phase = Phase.DAY;
  private elapsed = 0;
  private dayDuration: number;
  private nightMaxDuration: number;

  private safeZoneBg: Phaser.GameObjects.Rectangle;
  private outsideBg: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, safeZoneBg: Phaser.GameObjects.Rectangle, outsideBg: Phaser.GameObjects.Rectangle) {
    this.scene = scene;
    this.dayDuration = DAY_DURATION;
    this.nightMaxDuration = NIGHT_MAX_DURATION;
    this.safeZoneBg = safeZoneBg;
    this.outsideBg = outsideBg;
  }

  startDay(): void {
    this.phase = Phase.DAY;
    this.elapsed = 0;
    this.setDayColors();
    this.scene.events.emit('phaseChange', Phase.DAY);
  }

  startNight(): void {
    this.phase = Phase.NIGHT;
    this.elapsed = 0;
    this.setNightColors();
    this.scene.events.emit('phaseChange', Phase.NIGHT);
  }

  update(delta: number): void {
    this.elapsed += delta / 1000;

    if (this.phase === Phase.DAY && this.elapsed >= this.dayDuration) {
      this.startNight();
    } else if (this.phase === Phase.NIGHT && this.elapsed >= this.nightMaxDuration) {
      this.scene.events.emit('nightTimeout');
    }
  }

  getPhase(): Phase {
    return this.phase;
  }

  getTimeRemaining(): number {
    const max = this.phase === Phase.DAY ? this.dayDuration : this.nightMaxDuration;
    return Math.max(0, max - this.elapsed);
  }

  getElapsed(): number {
    return this.elapsed;
  }

  private setDayColors(): void {
    this.safeZoneBg.setFillStyle(0x3a5a2a);
    this.outsideBg.setFillStyle(0x5a7a4a);
  }

  private setNightColors(): void {
    this.safeZoneBg.setFillStyle(0x1a2a1a);
    this.outsideBg.setFillStyle(0x2a3a2a);
  }
}
