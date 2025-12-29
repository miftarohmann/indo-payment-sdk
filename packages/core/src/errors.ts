/**
 * Base error class for payment SDK
 */
export class PaymentError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'PaymentError';
    Object.setPrototypeOf(this, PaymentError.prototype);
  }
}

/**
 * Error when API request fails
 */
export class APIError extends PaymentError {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message, 'API_ERROR');
    this.name = 'APIError';
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

/**
 * Error when webhook validation fails
 */
export class WebhookError extends PaymentError {
  constructor(message: string) {
    super(message, 'WEBHOOK_ERROR');
    this.name = 'WebhookError';
    Object.setPrototypeOf(this, WebhookError.prototype);
  }
}

/**
 * Error when invalid configuration provided
 */
export class ConfigurationError extends PaymentError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR');
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}
