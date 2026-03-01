# 게임 에셋 가이드 (WP-4A)

## 에셋 생성

```bash
python3 scripts/generate-assets.py
```

`public/assets/`에 PNG 파일들이 생성됩니다.

## 스프라이트시트 좌표 (Phaser.js)

### npc-spritesheet.png (128×384)
- 프레임 크기: 32×32
- 총 12행 × 4프레임
- 행 순서:
  - 0: archer_common, 1: archer_rare, 2: archer_epic
  - 3: fixer_common,  4: fixer_rare,  5: fixer_epic
  - 6: farmer_common, 7: farmer_rare, 8: farmer_epic
  - 9: healer_common,10: healer_rare,11: healer_epic

```js
this.load.spritesheet('npc', 'assets/npc-spritesheet.png', { frameWidth:32, frameHeight:32 });
// 궁수 common 걷기: frames 0~3
this.anims.create({ key:'archer_walk', frames: this.anims.generateFrameNumbers('npc',{start:0,end:3}), frameRate:8, repeat:-1 });
```

### monster-spritesheet.png (128×96)
- 프레임 크기: 32×32
- Row 0: slime, Row 1: bat, Row 2: orc (각 4프레임)

```js
this.load.spritesheet('monster', 'assets/monster-spritesheet.png', { frameWidth:32, frameHeight:32 });
```

### tileset.png (128×64)
- 프레임 크기: 32×32
- Row 0 (낮): inside(0), wall(1), outside(2), path(3)
- Row 1 (밤): inside(4), wall(5), outside(6), path(7)

```js
this.load.spritesheet('tiles', 'assets/tileset.png', { frameWidth:32, frameHeight:32 });
```

### effect-spritesheet.png (128×96)
- 프레임 크기: 32×32
- Row 0: heal effect (4프레임)
- Row 1: hit effect (4프레임)
- Row 2: collect effect (4프레임)

### logo.png — 512×512 앱 로고
### og-image.png — 1200×630 OG 이미지

## 컬러 팔레트 (TDS 기반)
| 용도 | 색상 | HEX |
|------|------|-----|
| Primary | Blue | #005FFF |
| Secondary | Mint | #00D0A6 |
| Accent | Yellow | #FFC800 |
| Danger | Red | #FF5555 |
| Nature | Green | #32C864 |
| Magic | Purple | #8250C8 |
