import { MonsterType, WaveDef } from '../data/GameConfig';

export interface StageConfig {
  stage: number;
  waves: WaveDef[];
  wallMaxHp: number;
  dayDuration: number;
  nightMaxDuration: number;
  coinReward: number;
}

export class ProgressManager {
  static getStageConfig(stage: number, wallHpUpgrade: number = 0): StageConfig {
    const baseWallHp = 100 + wallHpUpgrade * 20;
    const wallMaxHp = baseWallHp + Math.floor(stage * 5);

    const dayDuration = Math.max(60, 90 - Math.floor(stage / 5) * 5);
    const nightMaxDuration = 120 + stage * 5;

    const waves = ProgressManager.generateWaves(stage);
    const coinReward = 30 + stage * 10;

    return { stage, waves, wallMaxHp, dayDuration, nightMaxDuration, coinReward };
  }

  private static generateWaves(stage: number): WaveDef[] {
    const waveCount = Math.min(2 + Math.floor(stage / 3), 8);
    const waves: WaveDef[] = [];

    for (let i = 0; i < waveCount; i++) {
      const delay = i * (12000 + Math.random() * 3000);
      const baseCount = 3 + Math.floor(stage * 0.8) + i;

      const monsters: { type: MonsterType; count: number }[] = [];

      // Basic monsters always
      monsters.push({ type: MonsterType.BASIC, count: Math.ceil(baseCount * 0.5) });

      // Fast from stage 2
      if (stage >= 2) {
        monsters.push({ type: MonsterType.FAST, count: Math.ceil(baseCount * 0.3) });
      }

      // Tank from stage 4
      if (stage >= 4) {
        monsters.push({ type: MonsterType.TANK, count: Math.max(1, Math.floor(baseCount * 0.2)) });
      }

      waves.push({ monsters, delay });
    }

    return waves;
  }

  static getMonsterHpMultiplier(stage: number): number {
    return 1 + (stage - 1) * 0.15;
  }

  static getMonsterSpeedMultiplier(stage: number): number {
    return 1 + (stage - 1) * 0.05;
  }

  static getMonsterDamageMultiplier(stage: number): number {
    return 1 + (stage - 1) * 0.1;
  }
}
