import Phaser from 'phaser';
import { Phase, ResourceType, WALL_CONFIG, SAFE_ZONE, NPC_CONFIG } from '../data/GameConfig';
import { Wall } from '../objects/Wall';
import { Monster } from '../objects/Monster';
import { NPC } from '../objects/NPC';
import { DayNightCycle } from '../systems/DayNightCycle';
import { WaveManager } from '../systems/WaveManager';
import { ResourceManager } from '../systems/ResourceManager';
import { NPCManager } from '../systems/NPCManager';
import { adManager } from '../toss';

export class GameScene extends Phaser.Scene {
  private wall!: Wall;
  private dayNightCycle!: DayNightCycle;
  private waveManager!: WaveManager;
  private resourceManager!: ResourceManager;
  private npcManager!: NPCManager;

  private monstersGroup!: Phaser.Physics.Arcade.Group;
  private projectilesGroup!: Phaser.Physics.Arcade.Group;

  private playerResources!: Map<ResourceType, number>;

  private phaseText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private herbText!: Phaser.GameObjects.Text;
  private bandageText!: Phaser.GameObjects.Text;
  private woodText!: Phaser.GameObjects.Text;
  private infoText!: Phaser.GameObjects.Text;

  private safeZoneBg!: Phaser.GameObjects.Rectangle;
  private outsideBg!: Phaser.GameObjects.Rectangle;

  private monstersKilled = 0;
  private gameOver = false;
  private stage = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(data?: { stage?: number }): void {
    this.gameOver = false;
    this.monstersKilled = 0;
    this.stage = data?.stage ?? 0;

    // Show interstitial ad every 3 stages
    if (adManager.shouldShowInterstitial(this.stage)) {
      adManager.showInterstitialAd().catch(() => {});
    }

    this.playerResources = new Map([
      [ResourceType.HERB, 0],
      [ResourceType.BANDAGE, 0],
      [ResourceType.WOOD, 0],
    ]);

    this.createMap();
    this.wall = new Wall(this);

    this.monstersGroup = this.physics.add.group({ runChildUpdate: true });
    this.projectilesGroup = this.physics.add.group({ runChildUpdate: true });

    this.dayNightCycle = new DayNightCycle(this, this.safeZoneBg, this.outsideBg);
    this.resourceManager = new ResourceManager(this);
    this.npcManager = new NPCManager(this);
    this.waveManager = new WaveManager(this, this.monstersGroup, this.stage);

    this.createHUD();
    this.setupCollisions();
    this.setupEvents();
    this.setupInput();

    this.dayNightCycle.startDay();

    this.events.on('shutdown', this.handleShutdown, this);
  }

  private handleShutdown(): void {
    this.events.off('phaseChange');
    this.events.off('allWavesComplete');
    this.events.off('nightTimeout');
    this.events.off('waveStart');
    this.events.off('shutdown', this.handleShutdown, this);

    this.waveManager?.stop();

    const monsters = this.monstersGroup?.getChildren() as Monster[] | undefined;
    if (monsters) {
      for (const m of [...monsters]) {
        m.cleanup();
        m.destroy();
      }
    }

    const projectiles = this.projectilesGroup?.getChildren() as Phaser.Physics.Arcade.Sprite[] | undefined;
    if (projectiles) {
      for (const p of [...projectiles]) {
        p.destroy();
      }
    }

    if (this.npcManager && typeof (this.npcManager as any).destroy === 'function') {
      (this.npcManager as any).destroy();
    }
    if (this.resourceManager && typeof (this.resourceManager as any).destroy === 'function') {
      (this.resourceManager as any).destroy();
    }
  }

  update(time: number, delta: number): void {
    if (this.gameOver) return;

    this.dayNightCycle.update(delta);

    const phase = this.dayNightCycle.getPhase();

    if (phase === Phase.DAY) {
      this.resourceManager.update(time);
      this.npcManager.updateDay(
        time, delta, this.wall,
        this.resourceManager.getResources(),
        this.projectilesGroup,
        (type) => this.addResource(type),
      );
    } else {
      this.waveManager.update(time);
      this.npcManager.updateNight(
        time, delta,
        this.waveManager.getAliveMonsters(),
        this.wall,
        this.resourceManager.getResources(),
        this.projectilesGroup,
      );
    }

    this.updateMonsters(time);
    this.updateHUD();
    this.checkConditions();
  }

  private createMap(): void {
    const h = this.scale.height;
    const w = this.scale.width;

    this.safeZoneBg = this.add.rectangle(
      WALL_CONFIG.x / 2, h / 2,
      WALL_CONFIG.x, h,
      0x3a5a2a,
    ).setDepth(0);

    this.outsideBg = this.add.rectangle(
      WALL_CONFIG.x + WALL_CONFIG.width + (w - WALL_CONFIG.x - WALL_CONFIG.width) / 2,
      h / 2,
      w - WALL_CONFIG.x - WALL_CONFIG.width,
      h,
      0x5a7a4a,
    ).setDepth(0);

    this.add.text(SAFE_ZONE.x + SAFE_ZONE.width / 2, h - 14, 'Safe Zone', {
      fontSize: '11px', color: '#ffffff44',
    }).setOrigin(0.5).setDepth(1);

    this.add.text(WALL_CONFIG.x + WALL_CONFIG.width + 100, h - 14, 'Outside', {
      fontSize: '11px', color: '#ffffff44',
    }).setOrigin(0.5).setDepth(1);
  }

  private createHUD(): void {
    this.phaseText = this.add.text(10, 36, 'DAY', {
      fontSize: '18px', color: '#ffff00', fontStyle: 'bold',
    }).setDepth(30);

    this.timerText = this.add.text(10, 58, '90s', {
      fontSize: '14px', color: '#ffffff',
    }).setDepth(30);

    this.waveText = this.add.text(10, 78, '', {
      fontSize: '12px', color: '#ff8888',
    }).setDepth(30);

    const rx = this.scale.width - 10;
    this.herbText = this.add.text(rx, 36, 'H: 0', {
      fontSize: '13px', color: '#22cc22',
    }).setOrigin(1, 0).setDepth(30);

    this.bandageText = this.add.text(rx, 54, 'B: 0', {
      fontSize: '13px', color: '#eeeeee',
    }).setOrigin(1, 0).setDepth(30);

    this.woodText = this.add.text(rx, 72, 'W: 0', {
      fontSize: '13px', color: '#cc9944',
    }).setOrigin(1, 0).setDepth(30);

    this.infoText = this.add.text(this.scale.width / 2, this.scale.height / 2, '', {
      fontSize: '20px', color: '#ffffff', backgroundColor: '#00000088',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setDepth(50).setAlpha(0);
  }

  private updateHUD(): void {
    const phase = this.dayNightCycle.getPhase();
    const remaining = Math.ceil(this.dayNightCycle.getTimeRemaining());

    this.phaseText.setText(phase === Phase.DAY ? 'DAY' : 'NIGHT');
    this.phaseText.setColor(phase === Phase.DAY ? '#ffff00' : '#6666ff');
    this.timerText.setText(`${remaining}s`);

    if (phase === Phase.NIGHT) {
      this.waveText.setText(`Wave ${this.waveManager.getCurrentWave()}/${this.waveManager.getTotalWaves()}`);
    } else {
      this.waveText.setText('');
    }

    this.herbText.setText(`H: ${this.playerResources.get(ResourceType.HERB) ?? 0}`);
    this.bandageText.setText(`B: ${this.playerResources.get(ResourceType.BANDAGE) ?? 0}`);
    this.woodText.setText(`W: ${this.playerResources.get(ResourceType.WOOD) ?? 0}`);
  }

  private setupCollisions(): void {
    this.physics.add.overlap(this.projectilesGroup, this.monstersGroup, (_proj, _mon) => {
      const proj = _proj as Phaser.Physics.Arcade.Sprite;
      const mon = _mon as Monster;
      if (!proj.active || !mon.active) return;
      const dmg = (proj as unknown as { dmg: number }).dmg ?? 10;
      const killed = mon.hit(dmg);
      if (killed) this.monstersKilled++;
      proj.destroy();
    });
  }

  private setupEvents(): void {
    this.events.on('phaseChange', (phase: Phase) => {
      if (phase === Phase.NIGHT) {
        this.resourceManager.setActive(false);
        this.waveManager.startNight(this.time.now);
        this.showInfo('Night falls... Monsters approach!');
      } else {
        this.resourceManager.setActive(true);
        this.showInfo('Day breaks! Collect resources.');
      }
    });

    this.events.on('allWavesComplete', () => {
      this.endGame(true);
    });

    this.events.on('nightTimeout', () => {
      if (!this.wall.isDestroyed()) {
        this.endGame(true);
      }
    });

    this.events.on('waveStart', (wave: number, total: number) => {
      this.showInfo(`Wave ${wave}/${total}`);
    });
  }

  private setupInput(): void {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.gameOver) return;

      const hits = this.input.hitTestPointer(pointer);

      for (const obj of hits) {
        const resource = obj.getData('resource');
        if (resource) {
          const res = resource as import('../objects/Resource').Resource;
          if (res.collect(this)) {
            this.addResource(res.type);
          }
          return;
        }

        const npc = obj.getData('npc');
        if (npc) {
          const npcObj = npc as NPC;
          if (npcObj.state === 'injured') {
            const success = this.npcManager.tryHealNPC(npcObj, this.playerResources, this.wall);
            if (success) {
              this.showInfo(`${NPC_CONFIG[npcObj.npcType].label} healed!`);
            } else {
              this.showInfo('Not enough resources!');
            }
          }
          return;
        }
      }
    });
  }

  private updateMonsters(time: number): void {
    const wallRight = this.wall.getRightEdge();

    const monsters = this.monstersGroup.getChildren() as Monster[];
    for (const m of monsters) {
      if (!m.active) continue;

      if (m.x <= wallRight + m.displayWidth / 2) {
        if (!m.attacking) m.setAttacking(true);
        if (m.canAttack(time)) {
          const dmg = m.doAttack(time);
          this.wall.takeDamage(dmg);
          this.npcManager.applyWallSplashDamage(dmg);
        }
      }

      if (m.x < -50) {
        m.cleanup();
        m.destroy();
      }
    }
  }

  private checkConditions(): void {
    if (this.wall.isDestroyed()) {
      this.endGame(false);
    }
  }

  private endGame(victory: boolean): void {
    if (this.gameOver) return;
    this.gameOver = true;
    this.waveManager.stop();

    this.time.delayedCall(1000, () => {
      this.scene.start('ResultScene', {
        victory,
        wallHp: Math.ceil(this.wall.hp),
        wallMaxHp: this.wall.maxHp,
        monstersKilled: this.monstersKilled,
        npcsHealed: this.npcManager.getHealedCount(),
        stage: this.stage,
      });
    });
  }

  private addResource(type: ResourceType): void {
    const current = this.playerResources.get(type) ?? 0;
    this.playerResources.set(type, current + 1);
  }

  private showInfo(text: string): void {
    this.infoText.setText(text).setAlpha(1);
    this.tweens.add({
      targets: this.infoText,
      alpha: 0,
      duration: 600,
      delay: 1200,
    });
  }
}
