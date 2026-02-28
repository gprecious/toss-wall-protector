import Phaser from 'phaser';
import { DayNightCycle, Phase } from '../systems/DayNightCycle';
import { ResourceManager } from '../systems/ResourceManager';
import { Wall } from '../objects/Wall';

export class GameScene extends Phaser.Scene {
  private dayNight!: DayNightCycle;
  private resourceMgr!: ResourceManager;
  wall!: Wall;
  private paused = false;
  private pauseOverlay?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    // --- Map zones ---
    // Outside wall (top area) — green field
    this.add.rectangle(width / 2, height * 0.3, width, height * 0.6, 0x3a7d3a)
      .setDepth(0);

    // Inside wall (bottom area) — village
    this.add.rectangle(width / 2, height * 0.85, width, height * 0.3, 0x5a8a5a)
      .setDepth(0);

    // Zone labels
    this.add.text(16, height * 0.05, '🌲 성벽 밖', {
      fontSize: '12px', color: '#aaddaa',
    }).setDepth(10);

    this.add.text(16, height * 0.75, '🏠 성벽 안', {
      fontSize: '12px', color: '#aaddaa',
    }).setDepth(10);

    // --- Wall ---
    this.wall = new Wall(this, 100);

    // --- Systems ---
    this.dayNight = new DayNightCycle(this, {
      dayDuration: 90,
      nightDuration: 120,
      transitionDuration: 1500,
    });

    this.resourceMgr = new ResourceManager(this);
    this.resourceMgr.startSpawning(2500);

    // Phase change handler
    this.dayNight.setOnPhaseChange((phase: Phase) => {
      if (phase === 'night') {
        // Reduce spawning at night
        this.resourceMgr.stopSpawning();
        this.resourceMgr.startSpawning(5000);
      } else if (phase === 'day') {
        // Resume normal spawning
        this.resourceMgr.stopSpawning();
        this.resourceMgr.startSpawning(2500);
      }
    });

    // --- Pause button ---
    const pauseBtn = this.add.text(width / 2, 16, '⏸ 일시정지', {
      fontSize: '14px', color: '#cccccc', backgroundColor: '#00000066',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5, 0).setDepth(1000).setInteractive({ useHandCursor: true });

    pauseBtn.on('pointerdown', () => this.togglePause());
  }

  private togglePause() {
    if (this.paused) {
      this.resumeGame();
    } else {
      this.pauseGame();
    }
  }

  private pauseGame() {
    this.paused = true;
    this.dayNight.pause();
    this.resourceMgr.setEnabled(false);

    const { width, height } = this.scale;

    // Pause overlay
    const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.6);
    const title = this.add.text(0, -40, '⏸ 일시정지', {
      fontSize: '32px', color: '#ffffff',
    }).setOrigin(0.5);

    const resumeBtn = this.add.text(0, 30, '▶ 계속하기', {
      fontSize: '22px', color: '#44cc44', backgroundColor: '#00000088',
      padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    resumeBtn.on('pointerdown', () => this.resumeGame());

    this.pauseOverlay = this.add.container(width / 2, height / 2, [bg, title, resumeBtn])
      .setDepth(2000);
  }

  private resumeGame() {
    this.paused = false;
    this.dayNight.resume();
    this.resourceMgr.setEnabled(true);
    this.pauseOverlay?.destroy();
    this.pauseOverlay = undefined;
  }
}
