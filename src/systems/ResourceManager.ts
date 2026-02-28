import Phaser from 'phaser';

export interface ResourceType {
  key: string;
  name: string;
  color: number;
  weight: number; // spawn weight
}

export const RESOURCE_TYPES: ResourceType[] = [
  { key: 'herb', name: '약초', color: 0x44bb44, weight: 5 },
  { key: 'stone', name: '돌', color: 0x888888, weight: 3 },
  { key: 'wood', name: '나무', color: 0x8b5e3c, weight: 4 },
];

export interface CollectedResources {
  [key: string]: number;
}

export class ResourceManager {
  private scene: Phaser.Scene;
  private resources: Phaser.GameObjects.Group;
  private collected: CollectedResources = {};
  private spawnTimer?: Phaser.Time.TimerEvent;
  private uiText: Phaser.GameObjects.Text;
  private toastText: Phaser.GameObjects.Text;
  private spawnAreaY: { min: number; max: number };
  private enabled = true;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.resources = scene.add.group();
    const { width, height } = scene.scale;

    // Spawn area: outside the wall (top portion of map)
    this.spawnAreaY = { min: 60, max: height * 0.55 };

    // Initialize collected
    for (const rt of RESOURCE_TYPES) {
      this.collected[rt.key] = 0;
    }

    // Resource counter UI
    this.uiText = scene.add.text(16, 16, '', {
      fontSize: '16px', color: '#ffffff',
    }).setDepth(1000);

    // Toast text for collection feedback
    this.toastText = scene.add.text(width / 2, height - 50, '', {
      fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(1000).setAlpha(0);

    this.updateUI();
  }

  startSpawning(interval = 2000) {
    this.spawnTimer = this.scene.time.addEvent({
      delay: interval,
      loop: true,
      callback: () => {
        if (!this.enabled) return;
        this.spawnResource();
      },
    });
    // Initial spawn
    for (let i = 0; i < 3; i++) this.spawnResource();
  }

  stopSpawning() {
    this.spawnTimer?.destroy();
  }

  setEnabled(v: boolean) { this.enabled = v; }

  private pickRandomType(): ResourceType {
    const totalWeight = RESOURCE_TYPES.reduce((s, r) => s + r.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const rt of RESOURCE_TYPES) {
      roll -= rt.weight;
      if (roll <= 0) return rt;
    }
    return RESOURCE_TYPES[0];
  }

  private spawnResource() {
    if (this.resources.getLength() >= 8) return;

    const { width } = this.scene.scale;
    const rt = this.pickRandomType();
    const x = Phaser.Math.Between(40, width - 40);
    const y = Phaser.Math.Between(this.spawnAreaY.min, this.spawnAreaY.max);

    const circle = this.scene.add.circle(x, y, 14, rt.color)
      .setInteractive({ useHandCursor: true })
      .setDepth(100)
      .setData('resourceType', rt);

    // Label on the resource
    const label = this.scene.add.text(x, y, rt.key[0].toUpperCase(), {
      fontSize: '12px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(101);

    circle.setData('label', label);

    // Tap to collect
    circle.on('pointerdown', () => this.collectResource(circle));

    // Gentle bob animation
    this.scene.tweens.add({
      targets: circle,
      y: y - 4,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.resources.add(circle);
  }

  private collectResource(obj: Phaser.GameObjects.Arc) {
    const rt = obj.getData('resourceType') as ResourceType;
    const label = obj.getData('label') as Phaser.GameObjects.Text;

    this.collected[rt.key]++;
    this.updateUI();
    this.showToast(`${rt.name} +1`, rt.color);

    // Collect animation
    this.scene.tweens.add({
      targets: [obj, label],
      alpha: 0,
      scale: 1.5,
      duration: 200,
      onComplete: () => {
        label.destroy();
        obj.destroy();
      },
    });
  }

  private showToast(text: string, color: number) {
    const hex = '#' + color.toString(16).padStart(6, '0');
    this.toastText.setText(text).setColor(hex).setAlpha(1);
    this.scene.tweens.add({
      targets: this.toastText,
      alpha: 0,
      y: this.toastText.y - 20,
      duration: 800,
      onComplete: () => {
        this.toastText.y += 20;
      },
    });
  }

  private updateUI() {
    const parts = RESOURCE_TYPES.map(rt => `${rt.name}: ${this.collected[rt.key]}`);
    this.uiText.setText(parts.join('  '));
  }

  getCollected(): CollectedResources { return { ...this.collected }; }
  getCount(key: string): number { return this.collected[key] ?? 0; }
  getTotalCount(): number { return Object.values(this.collected).reduce((a, b) => a + b, 0); }

  consume(key: string, amount: number): boolean {
    if ((this.collected[key] ?? 0) < amount) return false;
    this.collected[key] -= amount;
    this.updateUI();
    return true;
  }

  clearField() {
    this.resources.getChildren().forEach((c) => {
      const obj = c as Phaser.GameObjects.Arc;
      const label = obj.getData('label') as Phaser.GameObjects.Text;
      label?.destroy();
    });
    this.resources.clear(true, true);
  }

  destroy() {
    this.stopSpawning();
    this.clearField();
    this.uiText.destroy();
    this.toastText.destroy();
  }
}
