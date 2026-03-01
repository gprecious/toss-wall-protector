import { getGraniteSDK } from './TossSDK';

export class ShareManager {
  async shareScore(stage: number, score: number): Promise<string | null> {
    const title = `성벽 수호자 - 스테이지 ${stage} 클리어!`;
    const description = `${score}점 달성! 🏰 나의 성벽을 지켜보세요!`;
    try {
      const sdk = getGraniteSDK();
      if (sdk?.share) {
        const link = await sdk.share.getTossShareLink({ title, description });
        return link;
      }
      console.warn('[ShareManager] Stub: share link generated');
      return `https://toss.im/wall-protector/share?stage=${stage}&score=${score}`;
    } catch (e) {
      console.error('[ShareManager] Failed to generate share link:', e);
      return null;
    }
  }

  async shareToFeed(stage: number, score: number): Promise<boolean> {
    const title = `성벽 수호자 - 스테이지 ${stage}`;
    const description = `${score}점으로 성벽을 지켰습니다! 도전해보세요 🏰`;
    try {
      const sdk = getGraniteSDK();
      if (sdk?.share) {
        await sdk.share.shareToFeed({ title, description });
        return true;
      }
      console.warn('[ShareManager] Stub: shared to feed');
      return true;
    } catch (e) {
      console.error('[ShareManager] Failed to share to feed:', e);
      return false;
    }
  }
}
