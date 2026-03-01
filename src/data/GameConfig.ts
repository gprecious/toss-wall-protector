export enum ResourceType {
  HERB = 'herb',
  BANDAGE = 'bandage',
  WOOD = 'wood',
}

export enum NPCType {
  ARCHER = 'archer',
  REPAIRER = 'repairer',
  FARMER = 'farmer',
  HEALER = 'healer',
}

export enum MonsterType {
  BASIC = 'basic',
  FAST = 'fast',
  TANK = 'tank',
}

export enum Phase {
  DAY = 'day',
  NIGHT = 'night',
}

export const WALL_CONFIG = {
  x: 280,
  width: 20,
  maxHp: 100,
  color: 0x8b6914,
};

export const DAY_DURATION = 90;
export const NIGHT_MAX_DURATION = 120;

export const SAFE_ZONE = { x: 20, width: 240 };
export const MONSTER_SPAWN_X = 820;

export const RESOURCE_SPAWN_INTERVAL = 3000;
export const MAX_RESOURCES_ON_MAP = 8;

export interface ResourceConfig {
  color: number;
  label: string;
  spawnWeight: number;
}

export const RESOURCE_CONFIG: Record<ResourceType, ResourceConfig> = {
  [ResourceType.HERB]: { color: 0x22cc22, label: 'H', spawnWeight: 5 },
  [ResourceType.BANDAGE]: { color: 0xeeeeee, label: 'B', spawnWeight: 3 },
  [ResourceType.WOOD]: { color: 0x9b6b30, label: 'W', spawnWeight: 2 },
};

export interface NPCConfig {
  label: string;
  color: number;
  cost: Record<ResourceType, number>;
  hp: number;
  attackDamage?: number;
  attackRange?: number;
  attackCooldown?: number;
  repairRate?: number;
  collectRange?: number;
  moveSpeed?: number;
  healRate?: number;
}

export const NPC_CONFIG: Record<NPCType, NPCConfig> = {
  [NPCType.ARCHER]: {
    label: 'Arc',
    color: 0x3366ff,
    cost: { [ResourceType.HERB]: 2, [ResourceType.BANDAGE]: 1, [ResourceType.WOOD]: 0 },
    hp: 50,
    attackDamage: 10,
    attackRange: 300,
    attackCooldown: 1000,
  },
  [NPCType.REPAIRER]: {
    label: 'Rep',
    color: 0xff8800,
    cost: { [ResourceType.HERB]: 1, [ResourceType.BANDAGE]: 0, [ResourceType.WOOD]: 2 },
    hp: 50,
    repairRate: 2,
  },
  [NPCType.FARMER]: {
    label: 'Frm',
    color: 0x00aa00,
    cost: { [ResourceType.HERB]: 1, [ResourceType.BANDAGE]: 1, [ResourceType.WOOD]: 1 },
    hp: 50,
    collectRange: 150,
    moveSpeed: 80,
  },
  [NPCType.HEALER]: {
    label: 'Hea',
    color: 0xff66cc,
    cost: { [ResourceType.HERB]: 3, [ResourceType.BANDAGE]: 1, [ResourceType.WOOD]: 0 },
    hp: 50,
    healRate: 5,
  },
};

export const NPC_SPAWN_INTERVAL = 8000;
export const MAX_INJURED_NPCS = 3;

export interface MonsterConfig {
  color: number;
  hp: number;
  damage: number;
  speed: number;
  size: number;
  attackCooldown: number;
}

export const MONSTER_CONFIG: Record<MonsterType, MonsterConfig> = {
  [MonsterType.BASIC]: { color: 0xff0000, hp: 30, damage: 5, speed: 60, size: 24, attackCooldown: 2000 },
  [MonsterType.FAST]: { color: 0xff4444, hp: 15, damage: 3, speed: 120, size: 18, attackCooldown: 1500 },
  [MonsterType.TANK]: { color: 0xaa0000, hp: 80, damage: 15, speed: 30, size: 36, attackCooldown: 3000 },
};

export interface WaveEntry {
  type: MonsterType;
  count: number;
}

export interface WaveDef {
  monsters: WaveEntry[];
  delay: number;
}

export const WAVE_CONFIG: WaveDef[][] = [
  [
    { monsters: [{ type: MonsterType.BASIC, count: 5 }], delay: 0 },
    { monsters: [{ type: MonsterType.BASIC, count: 3 }, { type: MonsterType.FAST, count: 2 }], delay: 15000 },
    { monsters: [{ type: MonsterType.BASIC, count: 2 }, { type: MonsterType.FAST, count: 2 }, { type: MonsterType.TANK, count: 1 }], delay: 30000 },
  ],
];

export const NPC_SPLASH_DAMAGE_RATIO = 0.2;
