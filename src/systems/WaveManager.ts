import Phaser from 'phaser';
import { WAVE_CONFIG, MONSTER_SPAWN_X, MonsterType } from '../data/GameConfig';
import { Monster } from '../objects/Monster';

export class WaveManager {
  private scene: Phaser.Scene;
  private monstersGroup: Phaser.Physics.Arcade.Group;
  private stageIndex: number;
  private currentWave = 0;
  private wavesStarted: boolean[] = [];
  private nightStartTime = 0;
  private allWavesSpawned = false;
  private active = false;

  constructor(scene: Phaser.Scene, monstersGroup: Phaser.Physics.Arcade.Group, stageIndex = 0) {
    this.scene = scene;
    this.monstersGroup = monstersGroup;
    this.stageIndex = Math.min(stageIndex, WAVE_CONFIG.length - 1);
  }

  startNight(time: number): void {
    this.active = true;
    this.nightStartTime = time;
    this.currentWave = 0;
    this.allWavesSpawned = false;
    this.wavesStarted = new Array(this.getWaves().length).fill(false);
  }

  stop(): void {
    this.active = false;
  }

  update(time: number): void {
    if (!this.active) return;

    const waves = this.getWaves();
    const elapsed = time - this.nightStartTime;

    for (let i = 0; i < waves.length; i++) {
      if (!this.wavesStarted[i] && elapsed >= waves[i].delay) {
        this.spawnWave(i);
        this.wavesStarted[i] = true;
        this.currentWave = i + 1;
        this.scene.events.emit('waveStart', this.currentWave, waves.length);
      }
    }

    if (!this.allWavesSpawned && this.wavesStarted.every(Boolean)) {
      this.allWavesSpawned = true;
    }

    if (this.allWavesSpawned && this.getAliveMonsters().length === 0) {
      this.active = false;
      this.scene.events.emit('allWavesComplete');
    }
  }

  private spawnWave(index: number): void {
    const wave = this.getWaves()[index];
    let spawnDelay = 0;

    for (const entry of wave.monsters) {
      for (let i = 0; i < entry.count; i++) {
        this.scene.time.delayedCall(spawnDelay, () => {
          if (!this.active) return;
          const y = Phaser.Math.Between(60, this.scene.scale.height - 60);
          const monster = new Monster(this.scene, MONSTER_SPAWN_X, y, entry.type as MonsterType);
          this.monstersGroup.add(monster);
        });
        spawnDelay += 600;
      }
    }
  }

  getAliveMonsters(): Monster[] {
    return this.monstersGroup.getChildren().filter(c => c.active) as Monster[];
  }

  getCurrentWave(): number {
    return this.currentWave;
  }

  getTotalWaves(): number {
    return this.getWaves().length;
  }

  isActive(): boolean {
    return this.active;
  }

  private getWaves() {
    return WAVE_CONFIG[this.stageIndex];
  }
}
