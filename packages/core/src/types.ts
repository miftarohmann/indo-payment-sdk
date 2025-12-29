/**
 * Supported currencies
 */
export type Currency = 'IDR' | 'USD' | 'SGD' | 'MYR';

/**
 * Payment status across all providers
 */
export type PaymentStatus =
  | 'pending'      // Payment created, waiting for payment
  | 'processing'   // Payment being processed
  | 'paid'         // Payment successful
  | 'failed'       // Payment failed
  | 'expired'      // Payment link expired
  | 'refunded'     // Payment refunded
  | 'cancelled';   // Payment cancelled

/**
 * Customer information
 */
export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

/**
 * Individual item in invoice
 */
export interface InvoiceItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
}

/**
 * Parameters to create invoice
 */
export interface CreateInvoiceParams {
  amount: number;
  currency: Currency;
  orderId: string;
  customer: CustomerInfo;
  items?: InvoiceItem[];
  metadata?: Record<string, any>;
  expiresIn?: number;        // Minutes until expiry
  successUrl?: string;       // Redirect after success
  failureUrl?: string;       // Redirect after failure
  description?: string;      // Payment description
}

/**
 * Invoice response
 */
export interface Invoice {
  id: string;                // Payment gateway's transaction ID
  orderId: string;           // Merchant's order ID
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  paymentUrl: string;        // URL for customer to pay
  expiresAt: Date;
  createdAt: Date;
  metadata?: Record<string, any>;
}

/**
 * Payment status check response
 */
export interface PaymentStatusResponse {
  id: string;
  orderId: string;
  status: PaymentStatus;
  amount: number;
  paidAt?: Date;
  paymentMethod?: string;    // e.g., 'gopay', 'qris', 'bank_transfer'
  metadata?: Record<string, any>;
}

/**
 * Webhook notification
 */
export interface WebhookNotification {
  orderId: string;
  status: PaymentStatus;
  amount: number;
  paidAt?: Date;
  paymentMethod?: string;
  rawData: any;              // Original webhook payload
}

/**
 * Payment provider interface
 */
export interface PaymentProvider {
  /**
   * Create a new payment invoice
   */
  createInvoice(params: CreateInvoiceParams): Promise<Invoice>;

  /**
   * Get payment status by transaction ID
   */
  getStatus(transactionId: string): Promise<PaymentStatusResponse>;

  /**
   * Verify webhook signature
   */
  verifyWebhook(body: any, headers: any): boolean;

  /**
   * Parse webhook notification
   */
  parseWebhook(body: any): WebhookNotification;
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  apiKey: string;
  environment?: 'sandbox' | 'production';
}
