import { NPCType } from '../data/GameConfig';

export interface UpgradeState {
  wallHp: number;
  npcAttack: number;
  npcHeal: number;
  collectEfficiency: number;
}

export interface DailyRewardState {
  lastClaimDate: string;
  streak: number;
}

export interface SaveData {
  currentStage: number;
  coins: number;
  upgrades: UpgradeState;
  collection: string[];
  dailyReward: DailyRewardState;
  totalMonstersKilled: number;
  totalNpcsHealed: number;
}

const SAVE_KEY = 'wall-protector-save';

const DEFAULT_SAVE: SaveData = {
  currentStage: 1,
  coins: 0,
  upgrades: { wallHp: 0, npcAttack: 0, npcHeal: 0, collectEfficiency: 0 },
  collection: [],
  dailyReward: { lastClaimDate: '', streak: 0 },
  totalMonstersKilled: 0,
  totalNpcsHealed: 0,
};

export class SaveManager {
  private data: SaveData;

  constructor() {
    this.data = this.load();
  }

  private load(): SaveData {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SaveData>;
        return {
          ...DEFAULT_SAVE,
          ...parsed,
          upgrades: { ...DEFAULT_SAVE.upgrades, ...(parsed.upgrades ?? {}) },
          dailyReward: { ...DEFAULT_SAVE.dailyReward, ...(parsed.dailyReward ?? {}) },
          collection: parsed.collection ?? [],
        };
      }
    } catch {
      // corrupted save
    }
    return {
      ...DEFAULT_SAVE,
      upgrades: { ...DEFAULT_SAVE.upgrades },
      dailyReward: { ...DEFAULT_SAVE.dailyReward },
      collection: [],
    };
  }

  save(): void {
    localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
  }

  get(): SaveData { return this.data; }

  addCoins(amount: number): void {
    this.data.coins += amount;
    this.save();
  }

  spendCoins(amount: number): boolean {
    if (this.data.coins < amount) return false;
    this.data.coins -= amount;
    this.save();
    return true;
  }

  setCurrentStage(stage: number): void {
    this.data.currentStage = Math.max(this.data.currentStage, stage);
    this.save();
  }

  addToCollection(npcType: NPCType, rarity: string): void {
    const key = `${npcType}:${rarity}`;
    if (!this.data.collection.includes(key)) {
      this.data.collection.push(key);
      this.save();
    }
  }

  hasInCollection(npcType: NPCType, rarity: string): boolean {
    return this.data.collection.includes(`${npcType}:${rarity}`);
  }

  getUpgradeLevel(key: keyof UpgradeState): number {
    return this.data.upgrades[key];
  }

  upgradeLevel(key: keyof UpgradeState): void {
    this.data.upgrades[key]++;
    this.save();
  }

  getDailyReward(): DailyRewardState {
    return this.data.dailyReward;
  }

  claimDailyReward(): { coins: number; rareNpc: string | null } {
    const today = new Date().toISOString().split('T')[0];
    const dr = this.data.dailyReward;

    if (dr.lastClaimDate === today) {
      return { coins: 0, rareNpc: null };
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dr.lastClaimDate === yesterday) {
      dr.streak = (dr.streak % 7) + 1;
    } else {
      dr.streak = 1;
    }
    dr.lastClaimDate = today;

    const baseCoins = 50;
    const coins = baseCoins + (dr.streak - 1) * 25;
    let rareNpc: string | null = null;

    if (dr.streak === 7) {
      const types = Object.values(NPCType);
      const randomType = types[Math.floor(Math.random() * types.length)];
      rareNpc = `${randomType}:rare`;
      this.addToCollection(randomType, 'rare');
    }

    this.data.coins += coins;
    this.save();
    return { coins, rareNpc };
  }

  addStats(monstersKilled: number, npcsHealed: number): void {
    this.data.totalMonstersKilled += monstersKilled;
    this.data.totalNpcsHealed += npcsHealed;
    this.save();
  }
}

let instance: SaveManager | null = null;
export function getSaveManager(): SaveManager {
  if (!instance) instance = new SaveManager();
  return instance;
}
