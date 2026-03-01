import Phaser from 'phaser';
import { NPCType, NPC_CONFIG, ResourceType, Phase } from '../data/GameConfig';
import { Monster } from './Monster';
import { Projectile } from './Projectile';
import { Wall } from './Wall';
import { Resource } from './Resource';

export type NPCState = 'injured' | 'active';

export class NPC {
  public readonly npcType: NPCType;
  public state: NPCState;
  public hp: number;
  public maxHp: number;
  public sprite: Phaser.GameObjects.Sprite;
  public label: Phaser.GameObjects.Text;
  public costText: Phaser.GameObjects.Text | null = null;

  private scene: Phaser.Scene;
  private lastActionTime = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, type: NPCType, state: NPCState) {
    this.scene = scene;
    this.npcType = type;
    this.state = state;
    const cfg = NPC_CONFIG[type];
    this.hp = state === 'injured' ? Math.floor(cfg.hp * 0.3) : cfg.hp;
    this.maxHp = cfg.hp;

    const texKey = state === 'injured' ? 'npc_injured' : `npc_${type}`;
    this.sprite = scene.add.sprite(x, y, texKey).setDepth(10);
    this.label = scene.add.text(x, y - 20, cfg.label, {
      fontSize: '10px', color: '#ffffff', backgroundColor: '#00000088',
    }).setOrigin(0.5).setDepth(11);

    if (state === 'injured') {
      this.sprite.setInteractive({ useHandCursor: true });
      this.sprite.setData('npc', this);
      const costStr = this.getCostString();
      this.costText = scene.add.text(x, y + 20, costStr, {
        fontSize: '9px', color: '#ffff00', backgroundColor: '#00000088',
      }).setOrigin(0.5).setDepth(11);
    }
  }

  getCost(): Record<ResourceType, number> {
    return { ...NPC_CONFIG[this.npcType].cost };
  }

  private getCostString(): string {
    const cost = NPC_CONFIG[this.npcType].cost;
    const parts: string[] = [];
    if (cost[ResourceType.HERB] > 0) parts.push(`H:${cost[ResourceType.HERB]}`);
    if (cost[ResourceType.BANDAGE] > 0) parts.push(`B:${cost[ResourceType.BANDAGE]}`);
    if (cost[ResourceType.WOOD] > 0) parts.push(`W:${cost[ResourceType.WOOD]}`);
    return parts.join(' ');
  }

  activate(wallX: number, wallY: number): void {
    this.state = 'active';
    this.hp = this.maxHp;
    this.sprite.removeInteractive();
    this.sprite.setTexture(`npc_${this.npcType}`);
    this.sprite.setPosition(wallX, wallY);
    this.label.setPosition(wallX, wallY - 20);
    this.costText?.destroy();
    this.costText = null;
  }

  updateAI(
    time: number,
    delta: number,
    phase: Phase,
    monsters: Monster[],
    wall: Wall,
    activeNPCs: NPC[],
    resources: Resource[],
    projectiles: Phaser.Physics.Arcade.Group,
    onResourceCollected?: (type: ResourceType) => void,
  ): void {
    if (this.state !== 'active') return;

    const cfg = NPC_CONFIG[this.npcType];
    const dt = delta / 1000;

    switch (this.npcType) {
      case NPCType.ARCHER:
        if (phase === Phase.NIGHT && monsters.length > 0) {
          if (time - this.lastActionTime >= (cfg.attackCooldown ?? 1000)) {
            const nearest = this.findNearest(monsters);
            if (nearest && Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, nearest.x, nearest.y) <= (cfg.attackRange ?? 300)) {
              const proj = new Projectile(this.scene, this.sprite.x + 15, this.sprite.y, nearest.x, nearest.y, cfg.attackDamage ?? 10);
              projectiles.add(proj);
              this.lastActionTime = time;
            }
          }
        }
        break;

      case NPCType.REPAIRER:
        if (wall.hp < wall.maxHp) {
          wall.repair((cfg.repairRate ?? 2) * dt);
        }
        break;

      case NPCType.FARMER:
        if (phase === Phase.DAY && resources.length > 0) {
          const nearRes = this.findNearestResource(resources);
          if (nearRes) {
            const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, nearRes.sprite.x, nearRes.sprite.y);
            if (dist <= 30) {
              if (nearRes.collect(this.scene) && onResourceCollected) {
                onResourceCollected(nearRes.type);
              }
            } else {
              const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, nearRes.sprite.x, nearRes.sprite.y);
              const speed = (cfg.moveSpeed ?? 80) * dt;
              this.sprite.x += Math.cos(angle) * speed;
              this.sprite.y += Math.sin(angle) * speed;
              this.label.setPosition(this.sprite.x, this.sprite.y - 20);
            }
          }
        } else if (phase === Phase.NIGHT) {
          const wx = wall.x - 10;
          if (Math.abs(this.sprite.x - wx) > 5) {
            const dir = wx > this.sprite.x ? 1 : -1;
            this.sprite.x += dir * (cfg.moveSpeed ?? 80) * dt;
            this.label.setPosition(this.sprite.x, this.sprite.y - 20);
          }
        }
        break;

      case NPCType.HEALER: {
        const damaged = activeNPCs.filter(n => n !== this && n.hp < n.maxHp && n.state === 'active');
        if (damaged.length > 0) {
          damaged.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);
          damaged[0].hp = Math.min(damaged[0].maxHp, damaged[0].hp + (cfg.healRate ?? 5) * dt);
        } else if (wall.hp < wall.maxHp) {
          wall.repair((cfg.healRate ?? 5) * 0.3 * dt);
        }
        break;
      }
    }
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      return true;
    }
    return false;
  }

  private findNearest(monsters: Monster[]): Monster | null {
    let best: Monster | null = null;
    let bestDist = Infinity;
    for (const m of monsters) {
      if (!m.active) continue;
      const d = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, m.x, m.y);
      if (d < bestDist) {
        bestDist = d;
        best = m;
      }
    }
    return best;
  }

  private findNearestResource(resources: Resource[]): Resource | null {
    let best: Resource | null = null;
    let bestDist = Infinity;
    for (const r of resources) {
      if (r.isCollected()) continue;
      const d = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, r.sprite.x, r.sprite.y);
      if (d < bestDist) {
        bestDist = d;
        best = r;
      }
    }
    return best;
  }

  destroy(): void {
    this.sprite.destroy();
    this.label.destroy();
    this.costText?.destroy();
  }
}
