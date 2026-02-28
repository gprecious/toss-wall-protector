export interface TossPaymentResult {
  success: boolean;
  orderId?: string;
  paymentKey?: string;
  amount?: number;
}

export interface TossSDKConfig {
  clientKey: string;
  customerKey: string;
}

export class TossSDK {
  private config: TossSDKConfig;

  constructor(config: TossSDKConfig) {
    this.config = config;
  }

  async requestPayment(_amount: number, _orderId: string): Promise<TossPaymentResult> {
    console.warn('[TossSDK] stub: requestPayment called');
    return { success: false };
  }

  async confirmPayment(_paymentKey: string, _orderId: string, _amount: number): Promise<TossPaymentResult> {
    console.warn('[TossSDK] stub: confirmPayment called');
    return { success: false };
  }

  getConfig(): TossSDKConfig {
    return { ...this.config };
  }
}
