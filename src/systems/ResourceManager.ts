import Phaser from 'phaser';
import { ResourceType, RESOURCE_CONFIG, RESOURCE_SPAWN_INTERVAL, MAX_RESOURCES_ON_MAP, SAFE_ZONE } from '../data/GameConfig';
import { Resource } from '../objects/Resource';

export class ResourceManager {
  private scene: Phaser.Scene;
  private resources: Resource[] = [];
  private lastSpawnTime = 0;
  private active = true;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  setActive(val: boolean): void {
    this.active = val;
  }

  update(time: number): void {
    if (!this.active) return;

    this.resources = this.resources.filter(r => !r.isCollected() && r.sprite.active);

    if (this.resources.length < MAX_RESOURCES_ON_MAP && time - this.lastSpawnTime >= RESOURCE_SPAWN_INTERVAL) {
      this.spawnResource();
      this.lastSpawnTime = time;
    }
  }

  getResources(): Resource[] {
    return this.resources.filter(r => !r.isCollected());
  }

  private spawnResource(): void {
    const type = this.randomType();
    const x = Phaser.Math.Between(SAFE_ZONE.x, SAFE_ZONE.x + SAFE_ZONE.width);
    const y = Phaser.Math.Between(60, this.scene.scale.height - 40);
    const resource = new Resource(this.scene, x, y, type);
    this.resources.push(resource);
  }

  private randomType(): ResourceType {
    const types = Object.values(ResourceType);
    const weights = types.map(t => RESOURCE_CONFIG[t].spawnWeight);
    const total = weights.reduce((s, w) => s + w, 0);
    let r = Math.random() * total;
    for (let i = 0; i < types.length; i++) {
      r -= weights[i];
      if (r <= 0) return types[i];
    }
    return types[0];
  }

  destroyAll(): void {
    for (const r of this.resources) r.destroy();
    this.resources = [];
  }
}
