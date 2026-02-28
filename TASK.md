# WP-0: Vite + Phaser.js 3 + TypeScript 프로젝트 스캐폴딩

## 목표
Wall Protector 앱인토스 게임의 프로젝트 스캐폴딩을 만든다.

## 기술 스택
- Vite (빌드)
- Phaser.js 3 (2D 게임 엔진)
- TypeScript

## 프로젝트 구조 (반드시 따를 것)
```
src/
├── scenes/
│   ├── BootScene.ts          # 초기화, 에셋 로딩
│   ├── MenuScene.ts          # 메인 메뉴 (빈 씬)
│   ├── GameScene.ts          # 게임 메인 (빈 씬)
│   ├── ResultScene.ts        # 스테이지 결과 (빈 씬)
│   └── UpgradeScene.ts       # 업그레이드 상점 (빈 씬)
├── objects/                  # 빈 디렉토리 (placeholder)
├── systems/                  # 빈 디렉토리 (placeholder)
├── toss/
│   └── TossSDK.ts            # Granite SDK 래퍼 (stub)
├── data/                     # 빈 디렉토리 (placeholder)
└── main.ts                   # 진입점 - Phaser.Game 생성
public/
└── assets/                   # 빈 디렉토리
index.html
vite.config.ts
tsconfig.json
package.json
```

## 요구사항
1. `npm create vite@latest . -- --template vanilla-ts` 로 기본 세팅 후 커스터마이즈
2. phaser 패키지 설치: `npm install phaser`
3. main.ts: Phaser.Game 인스턴스 생성 (800x600, AUTO renderer)
4. BootScene: 간단한 "Loading..." 텍스트 후 MenuScene으로 전환
5. MenuScene: "Wall Protector" 타이틀 + "Start" 텍스트 (클릭시 GameScene)
6. GameScene: 빈 씬, "Game Scene" 텍스트만
7. 나머지 씬: 빈 placeholder
8. TossSDK.ts: Granite SDK 인터페이스 stub (실제 SDK는 나중에 연동)
9. vite.config.ts: base를 './'로 설정 (앱인토스 WebView 호환)
10. `npm run dev`로 로컬 서버 실행 가능해야 함
11. 모든 작업 후 git commit

## 완료 기준
- `npm run dev` 실행 시 브라우저에서 Phaser 빈 씬 렌더링 확인 가능
- 프로젝트 구조가 위 스펙과 일치
