import { NPCType, NPC_CONFIG } from '../data/GameConfig';
import { getSaveManager } from './SaveManager';

export type Rarity = 'normal' | 'rare' | 'epic';

export interface CollectionEntry {
  npcType: NPCType;
  rarity: Rarity;
  label: string;
  color: number;
  owned: boolean;
}

const RARITY_COLORS: Record<Rarity, number> = {
  normal: 0xaaaaaa,
  rare: 0x4488ff,
  epic: 0xaa44ff,
};

const RARITY_STAT_MULT: Record<Rarity, number> = {
  normal: 1.0,
  rare: 1.3,
  epic: 1.6,
};

export class CollectionManager {
  static getAllEntries(): CollectionEntry[] {
    const save = getSaveManager();
    const entries: CollectionEntry[] = [];
    const rarities: Rarity[] = ['normal', 'rare', 'epic'];

    for (const npcType of Object.values(NPCType)) {
      const cfg = NPC_CONFIG[npcType];
      for (const rarity of rarities) {
        entries.push({
          npcType,
          rarity,
          label: `${cfg.label} (${rarity})`,
          color: RARITY_COLORS[rarity],
          owned: save.hasInCollection(npcType, rarity),
        });
      }
    }
    return entries;
  }

  static getOwnedCount(): { owned: number; total: number } {
    const entries = CollectionManager.getAllEntries();
    return {
      owned: entries.filter(e => e.owned).length,
      total: entries.length,
    };
  }

  static registerNpc(npcType: NPCType): Rarity {
    const rarity = CollectionManager.rollRarity();
    getSaveManager().addToCollection(npcType, rarity);
    return rarity;
  }

  static rollRarity(): Rarity {
    const r = Math.random();
    if (r < 0.05) return 'epic';
    if (r < 0.2) return 'rare';
    return 'normal';
  }

  static getStatMultiplier(rarity: Rarity): number {
    return RARITY_STAT_MULT[rarity];
  }

  static getRarityColor(rarity: Rarity): number {
    return RARITY_COLORS[rarity];
  }
}
