import Phaser from 'phaser';
import { WAVE_CONFIG, MONSTER_SPAWN_X, MonsterType, WaveDef } from '../data/GameConfig';
import { Monster } from '../objects/Monster';

export class WaveManager {
  private scene: Phaser.Scene;
  private monstersGroup: Phaser.Physics.Arcade.Group;
  private waves: WaveDef[];
  private currentWave = 0;
  private wavesStarted: boolean[] = [];
  private nightStartTime = 0;
  private allWavesSpawned = false;
  private active = false;
  private hpMult: number;
  private speedMult: number;
  private dmgMult: number;

  constructor(
    scene: Phaser.Scene,
    monstersGroup: Phaser.Physics.Arcade.Group,
    stageIndex = 0,
    customWaves?: WaveDef[],
    hpMult = 1,
    speedMult = 1,
    dmgMult = 1,
  ) {
    this.scene = scene;
    this.monstersGroup = monstersGroup;
    this.waves = customWaves ?? WAVE_CONFIG[Math.min(stageIndex, WAVE_CONFIG.length - 1)];
    this.hpMult = hpMult;
    this.speedMult = speedMult;
    this.dmgMult = dmgMult;
  }

  startNight(time: number): void {
    this.active = true;
    this.nightStartTime = time;
    this.currentWave = 0;
    this.allWavesSpawned = false;
    this.wavesStarted = new Array(this.waves.length).fill(false);
  }

  stop(): void {
    this.active = false;
  }

  update(time: number): void {
    if (!this.active) return;

    const elapsed = time - this.nightStartTime;

    for (let i = 0; i < this.waves.length; i++) {
      if (!this.wavesStarted[i] && elapsed >= this.waves[i].delay) {
        this.spawnWave(i);
        this.wavesStarted[i] = true;
        this.currentWave = i + 1;
        this.scene.events.emit('waveStart', this.currentWave, this.waves.length);
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
    const wave = this.waves[index];
    let spawnDelay = 0;

    for (const entry of wave.monsters) {
      for (let i = 0; i < entry.count; i++) {
        this.scene.time.delayedCall(spawnDelay, () => {
          if (!this.active) return;
          const y = Phaser.Math.Between(60, this.scene.scale.height - 60);
          const monster = new Monster(
            this.scene, MONSTER_SPAWN_X, y, entry.type as MonsterType,
            this.hpMult, this.speedMult, this.dmgMult,
          );
          this.monstersGroup.add(monster);
        });
        spawnDelay += 600;
      }
    }
  }

  getAliveMonsters(): Monster[] {
    return this.monstersGroup.getChildren().filter(c => c.active) as Monster[];
  }

  getCurrentWave(): number { return this.currentWave; }
  getTotalWaves(): number { return this.waves.length; }
  isActive(): boolean { return this.active; }
}
