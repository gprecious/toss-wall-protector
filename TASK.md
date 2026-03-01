# WP-2: 메타 진행 시스템 구현 (Phase 2)

## 현재 상태
- Phase 1 (코어 게임플레이) 완료: 낮/밤 사이클, 재료 수집, NPC 치료/전투, 몬스터 웨이브, 성벽 방어, 스테이지 클리어/실패
- 브랜치: feat/WP-2-meta-progression (main에서 생성 완료)
- 기존 코드: src/scenes/, src/objects/, src/systems/, src/data/GameConfig.ts

## 구현 요구사항

### 2-1. 스테이지 진행 시스템 (난이도 스케일링)
- src/systems/ProgressManager.ts 생성
- 스테이지 번호에 따라 난이도 스케일링: 몬스터 HP/수/속도 증가, 웨이브 수 증가
- 현재 WAVE_CONFIG는 1스테이지만 정의되어 있음 → 스테이지별 동적 생성
- GameScene이 stage 파라미터를 받아 ProgressManager에서 난이도 계산
- ResultScene에서 "Next Stage" 시 stage+1 전달 (이미 구현됨)

### 2-2. NPC 도감/수집 시스템
- src/systems/CollectionManager.ts 생성
- 치료한 NPC 타입을 영구적으로 기록 (도감)
- NPC별 레어리티: normal, rare, epic (능력치 차이)
- 도감 화면: 메뉴에서 접근 가능한 CollectionScene 추가
- 수집 현황: 발견한 NPC / 전체 NPC 표시

### 2-3. 업그레이드 상점
- UpgradeScene.ts 구현 (현재 placeholder)
- 코인으로 구매 가능한 업그레이드:
  - 성벽 강화 (maxHp 증가)
  - NPC 공격력/치료 효율 업그레이드
  - 재료 수집 효율 증가
- 코인은 스테이지 클리어 시 획득 (ResultScene에서 지급)
- 업그레이드 레벨별 가격 증가

### 2-4. 데이터 저장/불러오기
- src/systems/SaveManager.ts 생성
- localStorage로 게임 데이터 저장:
  - 현재 스테이지, 코인, 업그레이드 레벨, NPC 도감
  - 일일 보상 수령 기록
- 게임 시작 시 자동 로드
- 스테이지 클리어/업그레이드 구매 시 자동 저장
- 토스 로그인 연동은 Phase 3에서 처리 (지금은 localStorage만)

### 2-5. 일일 보상/접속 보너스
- src/systems/DailyRewardManager.ts 생성
- 메뉴 화면에서 일일 보상 팝업
- 연속 접속 보너스 (1일차~7일차 순환)
- 보상: 코인 + 가끔 레어 NPC

## 기술 규칙
- TypeScript strict mode
- Phaser 3 API 사용
- 기존 코드 스타일/패턴 따를 것
- 새 씬은 src/main.ts에 등록
- npm run build 통과해야 함

## 작업 순서
1. SaveManager (다른 시스템이 의존)
2. ProgressManager (스테이지 스케일링)
3. CollectionManager (NPC 도감)
4. UpgradeScene (상점)
5. DailyRewardManager (일일 보상)
6. 기존 씬 연동 (GameScene, ResultScene, MenuScene 수정)
7. CollectionScene (도감 화면)
8. 빌드 확인

## 완료 후
- git add -A && git commit -m "feat: Phase 2 meta progression system"
- npm run build 통과 확인

완료되면 다음 명령 실행:
openclaw system event --text "Done: WP-2 Phase 2 meta progression (stages/collection/upgrades/save/daily rewards) implemented" --mode now
