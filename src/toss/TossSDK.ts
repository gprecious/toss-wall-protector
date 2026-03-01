/**
 * Granite SDK wrapper — accessed via window.granite in Apps-in-Toss WebView
 * Falls back to stub in local dev environments
 */

declare global {
  interface Window {
    granite?: GraniteSDK;
  }
}

export interface GraniteSDK {
  ad?: {
    loadRewardedAd(): Promise<void>;
    showRewardedAd(): Promise<{ rewarded: boolean }>;
    loadInterstitialAd(): Promise<void>;
    showInterstitialAd(): Promise<void>;
  };
  iap?: {
    getProducts(ids: string[]): Promise<GraniteProduct[]>;
    purchase(productId: string): Promise<GranitePurchaseResult>;
    restorePurchases(): Promise<GraniteRestoreResult>;
  };
  share?: {
    getTossShareLink(params: { title: string; description: string; imageUrl?: string }): Promise<string>;
    shareToFeed(params: { title: string; description: string; link?: string }): Promise<void>;
  };
  gameCenter?: {
    submitLeaderBoardScore(params: { leaderboardId: string; score: number }): Promise<void>;
    getLeaderboard(params: { leaderboardId: string; limit?: number }): Promise<GraniteLeaderboardEntry[]>;
  };
  appLogin?(): Promise<{ userId: string; token: string }>;
}

export interface GraniteProduct {
  productId: string;
  title: string;
  price: string;
  priceAmount: number;
  currency: string;
}

export interface GranitePurchaseResult {
  success: boolean;
  productId: string;
  transactionId?: string;
  receipt?: string;
}

export interface GraniteRestoreResult {
  success: boolean;
  restoredProducts: string[];
}

export interface GraniteLeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  score: number;
}

export function getGraniteSDK(): GraniteSDK | null {
  if (typeof window !== 'undefined' && window.granite) {
    return window.granite;
  }
  return null;
}

export function isGraniteAvailable(): boolean {
  return getGraniteSDK() !== null;
}
