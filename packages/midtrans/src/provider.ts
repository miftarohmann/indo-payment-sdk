import { BasePaymentProvider } from '@indo-payment/core';
import type {
  CreateInvoiceParams,
  Invoice,
  PaymentStatusResponse,
  WebhookNotification,
  PaymentStatus,
} from '@indo-payment/core';
import type {
  MidtransConfig,
  MidtransSnapRequest,
  MidtransSnapResponse,
  MidtransStatusResponse,
} from './types';
import crypto from 'crypto';

export class MidtransProvider extends BasePaymentProvider {
  private serverKey: string;
  private clientKey?: string;
  private options?: MidtransConfig['options'];

  constructor(config: MidtransConfig) {
    super({
      apiKey: config.serverKey,
      environment: config.environment,
    });

    this.serverKey = config.serverKey;
    this.clientKey = config.clientKey;
    this.options = config.options;
  }

  protected getProductionUrl(): string {
    return 'https://app.midtrans.com';
  }

  protected getSandboxUrl(): string {
    return 'https://app.sandbox.midtrans.com';
  }

  /**
   * Get Core API URL for status checks
   */
  private getCoreApiUrl(): string {
    return this.environment === 'production'
      ? 'https://api.midtrans.com'
      : 'https://api.sandbox.midtrans.com';
  }

  protected getAuthHeaders(): Record<string, string> {
    const auth = Buffer.from(`${this.serverKey}:`).toString('base64');
    return {
      Authorization: `Basic ${auth}`,
    };
  }

  /**
   * Create payment invoice using Snap API
   */
  async createInvoice(params: CreateInvoiceParams): Promise<Invoice> {
    // Build Midtrans Snap request
    const snapRequest: MidtransSnapRequest = {
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.amount,
      },
      customer_details: {
        first_name: params.customer.name,
        email: params.customer.email,
        phone: params.customer.phone,
      },
    };

    // Add items if provided
    if (params.items && params.items.length > 0) {
      snapRequest.item_details = params.items.map((item, index) => ({
        id: item.id || `item-${index}`,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));
    }

    // Add enabled payments from options
    if (this.options?.enabledPayments) {
      snapRequest.enabled_payments = this.options.enabledPayments;
    }

    // Add credit card options
    if (this.options?.creditCard) {
      snapRequest.credit_card = this.options.creditCard;
    }

    // Add expiry if specified
    if (params.expiresIn) {
      const now = new Date();
      const startTime = formatMidtransDate(now);
      snapRequest.expiry = {
        start_time: startTime,
        unit: 'minute',
        duration: params.expiresIn,
      };
    }

    // Add success URL
    if (params.successUrl) {
      snapRequest.callbacks = {
        finish: params.successUrl,
      };
    }

    // Make API request to Snap endpoint
    const response = await this.request<MidtransSnapResponse>(
      '/snap/v1/transactions',
      {
        method: 'POST',
        body: JSON.stringify(snapRequest),
      }
    );

    // Calculate expiry time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + (params.expiresIn || 60));

    return {
      id: response.token,
      orderId: params.orderId,
      amount: params.amount,
      currency: params.currency,
      status: 'pending',
      paymentUrl: response.redirect_url,
      expiresAt,
      createdAt: new Date(),
      metadata: params.metadata,
    };
  }

  /**
   * Get payment status
   */
  async getStatus(orderId: string): Promise<PaymentStatusResponse> {
    // Use Core API for status check
    const url = `${this.getCoreApiUrl()}/v2/${orderId}/status`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
    };

    const res = await fetch(url, {
      method: 'GET',
      headers,
    });

    const rawResponse = await res.json() as Record<string, any>;

    // Log raw response for debugging
    console.log('[Midtrans] Raw status response:', JSON.stringify(rawResponse, null, 2));

    // Handle case where transaction not found or not yet paid
    // Midtrans returns 404 status_code when order exists but no payment attempted
    if (rawResponse.status_code === '404' || rawResponse.status_code === '401') {
      console.log('[Midtrans] Order belum dibayar atau tidak ditemukan');
      return {
        id: '',
        orderId: orderId,
        status: 'pending',
        amount: 0,
        metadata: { raw: rawResponse },
      };
    }

    const response = rawResponse as MidtransStatusResponse;

    return {
      id: response.transaction_id || '',
      orderId: response.order_id || orderId,
      status: this.mapStatus(response.transaction_status),
      amount: parseFloat(response.gross_amount) || 0,
      paidAt: response.settlement_time ? new Date(response.settlement_time) : undefined,
      paymentMethod: response.payment_type,
      metadata: { raw: rawResponse },
    };
  }

  /**
   * Verify webhook signature
   */
  verifyWebhook(body: any, _headers?: any): boolean {
    const { order_id, status_code, gross_amount, signature_key } = body;

    if (!signature_key) return false;

    const expectedSignature = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${this.serverKey}`)
      .digest('hex');

    return signature_key === expectedSignature;
  }

  /**
   * Parse webhook notification
   */
  parseWebhook(body: any): WebhookNotification {
    return {
      orderId: body.order_id,
      status: this.mapStatus(body.transaction_status),
      amount: parseFloat(body.gross_amount),
      paidAt: body.settlement_time ? new Date(body.settlement_time) : undefined,
      paymentMethod: body.payment_type,
      rawData: body,
    };
  }

  /**
   * Map Midtrans status to common status
   */
  private mapStatus(midtransStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      pending: 'pending',
      capture: 'paid',
      settlement: 'paid',
      deny: 'failed',
      cancel: 'cancelled',
      expire: 'expired',
      refund: 'refunded',
    };

    return statusMap[midtransStatus] || 'pending';
  }
}

/**
 * Format date for Midtrans API (YYYY-MM-DD HH:mm:ss +0700)
 */
function formatMidtransDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} +0700`;
}
