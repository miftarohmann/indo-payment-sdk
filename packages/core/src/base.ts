import type { PaymentProvider, ProviderConfig, CreateInvoiceParams, Invoice, PaymentStatusResponse, WebhookNotification } from './types';
import { ConfigurationError, APIError } from './errors';

/**
 * Base class for payment providers
 */
export abstract class BasePaymentProvider implements PaymentProvider {
  protected apiKey: string;
  protected environment: 'sandbox' | 'production';

  constructor(config: ProviderConfig) {
    if (!config.apiKey) {
      throw new ConfigurationError('API key is required');
    }

    this.apiKey = config.apiKey;
    this.environment = config.environment || 'sandbox';
  }

  /**
   * Get base URL for API calls
   */
  protected getBaseUrl(): string {
    return this.environment === 'production'
      ? this.getProductionUrl()
      : this.getSandboxUrl();
  }

  /**
   * Get production API URL (override in provider)
   */
  protected abstract getProductionUrl(): string;

  /**
   * Get sandbox API URL (override in provider)
   */
  protected abstract getSandboxUrl(): string;

  /**
   * Make HTTP request with proper auth
   */
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.getBaseUrl()}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json() as T & { message?: string; error_messages?: string[] };

    if (!response.ok) {
      throw new APIError(
        data.message || data.error_messages?.[0] || response.statusText,
        response.status,
        data
      );
    }

    return data as T;
  }

  /**
   * Get authentication headers (override in provider)
   */
  protected abstract getAuthHeaders(): Record<string, string>;

  // These must be implemented by concrete providers
  abstract createInvoice(params: CreateInvoiceParams): Promise<Invoice>;
  abstract getStatus(transactionId: string): Promise<PaymentStatusResponse>;
  abstract verifyWebhook(body: any, headers: any): boolean;
  abstract parseWebhook(body: any): WebhookNotification;
}
