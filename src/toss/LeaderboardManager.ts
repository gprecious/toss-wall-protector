import { getGraniteSDK, GraniteLeaderboardEntry } from './TossSDK';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  score: number;
}

const LEADERBOARD_ID = 'wall_protector_highscore';

export class LeaderboardManager {
  async submitScore(stage: number, score: number): Promise<boolean> {
    const combinedScore = stage * 10000 + score;
    try {
      const sdk = getGraniteSDK();
      if (sdk?.gameCenter) {
        await sdk.gameCenter.submitLeaderBoardScore({
          leaderboardId: LEADERBOARD_ID,
          score: combinedScore,
        });
        return true;
      }
      console.warn('[LeaderboardManager] Stub: score submitted', combinedScore);
      return true;
    } catch (e) {
      console.error('[LeaderboardManager] Failed to submit score:', e);
      return false;
    }
  }

  async getTopScores(limit = 10): Promise<LeaderboardEntry[]> {
    try {
      const sdk = getGraniteSDK();
      if (sdk?.gameCenter) {
        const entries: GraniteLeaderboardEntry[] = await sdk.gameCenter.getLeaderboard({
          leaderboardId: LEADERBOARD_ID,
          limit,
        });
        return entries.map(e => ({
          rank: e.rank,
          userId: e.userId,
          displayName: e.displayName,
          score: e.score,
        }));
      }
      console.warn('[LeaderboardManager] Stub: returning empty leaderboard');
      return [];
    } catch (e) {
      console.error('[LeaderboardManager] Failed to get leaderboard:', e);
      return [];
    }
  }
}
