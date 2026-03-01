import Phaser from 'phaser';
import { NPCType, NPC_SPAWN_INTERVAL, MAX_INJURED_NPCS, SAFE_ZONE, Phase, ResourceType, NPC_SPLASH_DAMAGE_RATIO } from '../data/GameConfig';
import { NPC } from '../objects/NPC';
import { Monster } from '../objects/Monster';
import { Wall } from '../objects/Wall';
import { Resource } from '../objects/Resource';

export class NPCManager {
  private scene: Phaser.Scene;
  private injuredNPCs: NPC[] = [];
  private activeNPCs: NPC[] = [];
  private lastSpawnTime = 0;
  private nextWallY = 80;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  spawnInjuredNPC(time: number): void {
    this.injuredNPCs = this.injuredNPCs.filter(n => n.sprite.active);
    if (this.injuredNPCs.length >= MAX_INJURED_NPCS) return;
    if (time - this.lastSpawnTime < NPC_SPAWN_INTERVAL) return;

    const types = Object.values(NPCType);
    const type = types[Phaser.Math.Between(0, types.length - 1)];
    const x = Phaser.Math.Between(SAFE_ZONE.x + 30, SAFE_ZONE.x + SAFE_ZONE.width - 30);
    const y = Phaser.Math.Between(80, this.scene.scale.height - 60);

    const npc = new NPC(this.scene, x, y, type, 'injured');
    this.injuredNPCs.push(npc);
    this.lastSpawnTime = time;
  }

  tryHealNPC(
    npc: NPC,
    playerResources: Map<ResourceType, number>,
    wall: Wall,
  ): boolean {
    const cost = npc.getCost();
    for (const [resType, amount] of Object.entries(cost)) {
      if ((playerResources.get(resType as ResourceType) ?? 0) < amount) return false;
    }

    for (const [resType, amount] of Object.entries(cost)) {
      const current = playerResources.get(resType as ResourceType) ?? 0;
      playerResources.set(resType as ResourceType, current - amount);
    }

    const wallX = wall.x - 15;
    const wallY = this.nextWallY;
    this.nextWallY += 50;
    if (this.nextWallY > this.scene.scale.height - 40) {
      this.nextWallY = 80;
    }

    npc.activate(wallX, wallY);
    this.injuredNPCs = this.injuredNPCs.filter(n => n !== npc);
    this.activeNPCs.push(npc);
    return true;
  }

  updateDay(
    time: number,
    delta: number,
    wall: Wall,
    resources: Resource[],
    projectiles: Phaser.Physics.Arcade.Group,
    onResourceCollected: (type: ResourceType) => void,
  ): void {
    this.spawnInjuredNPC(time);
    for (const npc of this.activeNPCs) {
      if (!npc.sprite.active) continue;
      npc.updateAI(time, delta, Phase.DAY, [], wall, this.activeNPCs, resources, projectiles, onResourceCollected);
    }
  }

  updateNight(
    time: number,
    delta: number,
    monsters: Monster[],
    wall: Wall,
    resources: Resource[],
    projectiles: Phaser.Physics.Arcade.Group,
  ): void {
    for (const npc of this.activeNPCs) {
      if (!npc.sprite.active) continue;
      npc.updateAI(time, delta, Phase.NIGHT, monsters, wall, this.activeNPCs, resources, projectiles);
    }
  }

  applyWallSplashDamage(monsterDamage: number): void {
    const splash = monsterDamage * NPC_SPLASH_DAMAGE_RATIO;
    for (const npc of this.activeNPCs) {
      if (npc.state !== 'active') continue;
      const dead = npc.takeDamage(splash);
      if (dead) {
        npc.destroy();
      }
    }
    this.activeNPCs = this.activeNPCs.filter(n => n.sprite.active);
  }

  getActiveNPCs(): NPC[] {
    return this.activeNPCs.filter(n => n.sprite.active);
  }

  getInjuredNPCs(): NPC[] {
    return this.injuredNPCs.filter(n => n.sprite.active);
  }

  getHealedCount(): number {
    return this.activeNPCs.length;
  }

  destroyAll(): void {
    for (const n of this.injuredNPCs) n.destroy();
    for (const n of this.activeNPCs) n.destroy();
    this.injuredNPCs = [];
    this.activeNPCs = [];
  }
}
