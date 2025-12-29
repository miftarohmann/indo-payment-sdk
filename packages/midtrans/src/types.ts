/**
 * Midtrans-specific configuration
 */
export interface MidtransConfig {
  serverKey: string;
  clientKey?: string;
  environment?: 'sandbox' | 'production';
  options?: {
    enabledPayments?: string[];  // ['gopay', 'qris', 'bank_transfer', etc]
    creditCard?: {
      secure?: boolean;
      bank?: string;
      installment?: {
        required?: boolean;
        terms?: Record<string, number[]>;
      };
    };
  };
}

/**
 * Midtrans Snap API request
 */
export interface MidtransSnapRequest {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  customer_details: {
    first_name: string;
    email: string;
    phone: string;
  };
  item_details?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  enabled_payments?: string[];
  credit_card?: any;
  expiry?: {
    start_time: string;
    unit: string;
    duration: number;
  };
  callbacks?: {
    finish?: string;
  };
}

/**
 * Midtrans Snap API response
 */
export interface MidtransSnapResponse {
  token: string;
  redirect_url: string;
}

/**
 * Midtrans transaction status response
 */
export interface MidtransStatusResponse {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status?: string;
  settlement_time?: string;
  signature_key?: string;
}
