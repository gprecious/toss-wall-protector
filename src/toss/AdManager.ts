import { getGraniteSDK } from './TossSDK';

const MAX_REWARDED_PER_SESSION = 5;

export class AdManager {
  private rewardedCount = 0;
  private adRemoved = false;
  private rewardedLoaded = false;
  private interstitialLoaded = false;

  setAdRemoved(removed: boolean): void {
    this.adRemoved = removed;
  }

  isAdRemoved(): boolean {
    return this.adRemoved;
  }

  canShowRewarded(): boolean {
    return this.rewardedCount < MAX_REWARDED_PER_SESSION;
  }

  async loadRewardedAd(): Promise<boolean> {
    try {
      const sdk = getGraniteSDK();
      if (sdk?.ad) {
        await sdk.ad.loadRewardedAd();
        this.rewardedLoaded = true;
        return true;
      }
      console.warn('[AdManager] Granite SDK not available, stub rewarded ad loaded');
      this.rewardedLoaded = true;
      return true;
    } catch (e) {
      console.error('[AdManager] Failed to load rewarded ad:', e);
      this.rewardedLoaded = false;
      return false;
    }
  }

  async showRewardedAd(): Promise<boolean> {
    if (!this.canShowRewarded()) {
      console.warn('[AdManager] Rewarded ad cap reached');
      return false;
    }
    if (!this.rewardedLoaded) {
      const loaded = await this.loadRewardedAd();
      if (!loaded) return false;
    }
    try {
      const sdk = getGraniteSDK();
      if (sdk?.ad) {
        const result = await sdk.ad.showRewardedAd();
        this.rewardedLoaded = false;
        if (result.rewarded) {
          this.rewardedCount++;
          return true;
        }
        return false;
      }
      // Stub: simulate successful reward
      console.warn('[AdManager] Stub: rewarded ad shown (simulated)');
      this.rewardedLoaded = false;
      this.rewardedCount++;
      return true;
    } catch (e) {
      console.error('[AdManager] Failed to show rewarded ad:', e);
      this.rewardedLoaded = false;
      return false;
    }
  }

  async loadInterstitialAd(): Promise<boolean> {
    if (this.adRemoved) return false;
    try {
      const sdk = getGraniteSDK();
      if (sdk?.ad) {
        await sdk.ad.loadInterstitialAd();
        this.interstitialLoaded = true;
        return true;
      }
      console.warn('[AdManager] Stub: interstitial ad loaded');
      this.interstitialLoaded = true;
      return true;
    } catch (e) {
      console.error('[AdManager] Failed to load interstitial ad:', e);
      this.interstitialLoaded = false;
      return false;
    }
  }

  async showInterstitialAd(): Promise<void> {
    if (this.adRemoved) {
      console.log('[AdManager] Ad removed, skipping interstitial');
      return;
    }
    if (!this.interstitialLoaded) {
      const loaded = await this.loadInterstitialAd();
      if (!loaded) return;
    }
    try {
      const sdk = getGraniteSDK();
      if (sdk?.ad) {
        await sdk.ad.showInterstitialAd();
        this.interstitialLoaded = false;
        return;
      }
      console.warn('[AdManager] Stub: interstitial ad shown (simulated)');
      this.interstitialLoaded = false;
    } catch (e) {
      console.error('[AdManager] Failed to show interstitial ad:', e);
      this.interstitialLoaded = false;
    }
  }

  shouldShowInterstitial(stage: number): boolean {
    return !this.adRemoved && stage > 0 && stage % 3 === 0;
  }
}
