import { getGraniteSDK, GraniteProduct, GranitePurchaseResult } from './TossSDK';

export type ProductId = 'ad_remove' | 'starter_pack' | 'gems_100' | 'gems_500' | 'monthly_pass';
export type ProductType = 'non_consumable' | 'consumable' | 'subscription';

export interface ProductInfo {
  id: ProductId;
  name: string;
  price: number;
  priceLabel: string;
  type: ProductType;
  description: string;
}

export interface PurchaseResult {
  success: boolean;
  productId: string;
  transactionId?: string;
}

const PRODUCT_CATALOG: ProductInfo[] = [
  { id: 'ad_remove', name: '광고 제거', price: 3900, priceLabel: '₩3,900', type: 'non_consumable', description: '전면/배너 광고 영구 제거 (보상형은 유지)' },
  { id: 'starter_pack', name: '스타터팩', price: 5900, priceLabel: '₩5,900', type: 'non_consumable', description: '보석 300 + 특별 NPC 1명' },
  { id: 'gems_100', name: '보석 100개', price: 1100, priceLabel: '₩1,100', type: 'consumable', description: '보석 100개' },
  { id: 'gems_500', name: '보석 500개', price: 4400, priceLabel: '₩4,400', type: 'consumable', description: '보석 500개' },
  { id: 'monthly_pass', name: '월간 패스', price: 2900, priceLabel: '₩2,900/월', type: 'subscription', description: '매일 보석 30 + 광고 보상 자동 2배' },
];

export class IAPManager {
  private purchasedProducts: Set<string> = new Set();
  private onPurchaseCallback?: (productId: ProductId) => void;

  getProductCatalog(): ProductInfo[] {
    return [...PRODUCT_CATALOG];
  }

  getProduct(id: ProductId): ProductInfo | undefined {
    return PRODUCT_CATALOG.find(p => p.id === id);
  }

  onPurchase(callback: (productId: ProductId) => void): void {
    this.onPurchaseCallback = callback;
  }

  async loadProducts(): Promise<GraniteProduct[]> {
    try {
      const sdk = getGraniteSDK();
      if (sdk?.iap) {
        return await sdk.iap.getProducts(PRODUCT_CATALOG.map(p => p.id));
      }
      console.warn('[IAPManager] Stub: returning catalog products');
      return PRODUCT_CATALOG.map(p => ({
        productId: p.id,
        title: p.name,
        price: p.priceLabel,
        priceAmount: p.price,
        currency: 'KRW',
      }));
    } catch (e) {
      console.error('[IAPManager] Failed to load products:', e);
      return [];
    }
  }

  async purchase(productId: ProductId): Promise<PurchaseResult> {
    try {
      const sdk = getGraniteSDK();
      let result: GranitePurchaseResult;
      if (sdk?.iap) {
        result = await sdk.iap.purchase(productId);
      } else {
        console.warn('[IAPManager] Stub: simulating purchase of', productId);
        result = { success: true, productId, transactionId: `stub_${Date.now()}` };
      }
      if (result.success) {
        const info = this.getProduct(productId);
        if (info && info.type !== 'consumable') {
          this.purchasedProducts.add(productId);
        }
        this.onPurchaseCallback?.(productId);
      }
      return { success: result.success, productId: result.productId, transactionId: result.transactionId };
    } catch (e) {
      console.error('[IAPManager] Purchase failed:', e);
      return { success: false, productId };
    }
  }

  async restorePurchases(): Promise<string[]> {
    try {
      const sdk = getGraniteSDK();
      if (sdk?.iap) {
        const result = await sdk.iap.restorePurchases();
        if (result.success) {
          for (const id of result.restoredProducts) {
            this.purchasedProducts.add(id);
          }
          return result.restoredProducts;
        }
        return [];
      }
      console.warn('[IAPManager] Stub: no purchases to restore');
      return [];
    } catch (e) {
      console.error('[IAPManager] Restore failed:', e);
      return [];
    }
  }

  isAdRemoved(): boolean {
    return this.purchasedProducts.has('ad_remove');
  }

  hasPurchased(productId: string): boolean {
    return this.purchasedProducts.has(productId);
  }

  hasMonthlyPass(): boolean {
    return this.purchasedProducts.has('monthly_pass');
  }
}
