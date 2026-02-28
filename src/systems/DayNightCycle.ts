import Phaser from 'phaser';

export type Phase = 'day' | 'night' | 'transition';

export interface DayNightConfig {
  dayDuration: number;    // seconds
  nightDuration: number;  // seconds
  transitionDuration: number; // ms for visual transition
}

const DEFAULT_CONFIG: DayNightConfig = {
  dayDuration: 90,
  nightDuration: 120,
  transitionDuration: 1500,
};

export class DayNightCycle {
  private scene: Phaser.Scene;
  private config: DayNightConfig;
  private _phase: Phase = 'day';
  private _timer: number;
  private overlay: Phaser.GameObjects.Rectangle;
  private timerText: Phaser.GameObjects.Text;
  private phaseText: Phaser.GameObjects.Text;
  private timerEvent?: Phaser.Time.TimerEvent;
  private paused = false;

  private onPhaseChange?: (phase: Phase) => void;
  private onTimerTick?: (remaining: number) => void;

  constructor(scene: Phaser.Scene, config?: Partial<DayNightConfig>) {
    this.scene = scene;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this._timer = this.config.dayDuration;

    const { width, height } = scene.scale;

    // Night overlay
    this.overlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000033, 0)
      .setDepth(900);

    // Timer UI
    this.timerText = scene.add.text(width - 16, 16, '', {
      fontSize: '20px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(1, 0).setDepth(1000);

    this.phaseText = scene.add.text(width - 16, 42, '', {
      fontSize: '14px', color: '#ffdd44',
    }).setOrigin(1, 0).setDepth(1000);

    this.updateUI();
    this.startTimer();
  }

  get phase(): Phase { return this._phase; }
  get timer(): number { return this._timer; }

  setOnPhaseChange(cb: (phase: Phase) => void) { this.onPhaseChange = cb; }
  setOnTimerTick(cb: (remaining: number) => void) { this.onTimerTick = cb; }

  pause() { this.paused = true; }
  resume() { this.paused = false; }
  get isPaused() { return this.paused; }

  private startTimer() {
    this.timerEvent = this.scene.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.paused || this._phase === 'transition') return;

        this._timer--;
        this.onTimerTick?.(this._timer);
        this.updateUI();

        if (this._timer <= 0) {
          this.switchPhase();
        }
      },
    });
  }

  private switchPhase() {
    const nextPhase: Phase = this._phase === 'day' ? 'night' : 'day';
    this._phase = 'transition';
    this.onPhaseChange?.('transition');

    const targetAlpha = nextPhase === 'night' ? 0.55 : 0;

    this.scene.tweens.add({
      targets: this.overlay,
      alpha: targetAlpha,
      duration: this.config.transitionDuration,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this._phase = nextPhase;
        this._timer = nextPhase === 'day'
          ? this.config.dayDuration
          : this.config.nightDuration;
        this.updateUI();
        this.onPhaseChange?.(nextPhase);
      },
    });
  }

  private updateUI() {
    const m = Math.floor(this._timer / 60);
    const s = this._timer % 60;
    this.timerText.setText(`${m}:${s.toString().padStart(2, '0')}`);

    const label = this._phase === 'day' ? '☀️ 낮' : this._phase === 'night' ? '🌙 밤' : '⏳ 전환 중';
    this.phaseText.setText(label);
  }

  destroy() {
    this.timerEvent?.destroy();
    this.overlay.destroy();
    this.timerText.destroy();
    this.phaseText.destroy();
  }
}
