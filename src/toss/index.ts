import { AdManager } from './AdManager';
import { IAPManager } from './IAPManager';
import { ShareManager } from './ShareManager';
import { LeaderboardManager } from './LeaderboardManager';

export const adManager = new AdManager();
export const iapManager = new IAPManager();
export const shareManager = new ShareManager();
export const leaderboardManager = new LeaderboardManager();

export function initSDK(): void {
  // Sync ad removal state from IAP
  iapManager.onPurchase((productId) => {
    if (productId === 'ad_remove') {
      adManager.setAdRemoved(true);
    }
  });

  // Restore purchases on init
  iapManager.restorePurchases().then(() => {
    if (iapManager.isAdRemoved()) {
      adManager.setAdRemoved(true);
    }
  }).catch(e => console.error('[SDK] restore failed:', e));

  // Preload ads
  adManager.loadRewardedAd().catch(() => {});
  adManager.loadInterstitialAd().catch(() => {});
}

export { AdManager } from './AdManager';
export { IAPManager, type ProductId, type ProductInfo, type PurchaseResult } from './IAPManager';
export { ShareManager } from './ShareManager';
export { LeaderboardManager, type LeaderboardEntry } from './LeaderboardManager';
export { getGraniteSDK, isGraniteAvailable } from './TossSDK';
