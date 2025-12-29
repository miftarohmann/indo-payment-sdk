import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MidtransProvider } from '../packages/midtrans/src';
import { ConfigurationError } from '../packages/core/src';
import crypto from 'crypto';

describe('MidtransProvider', () => {
  const mockServerKey = 'SB-Mid-server-test123';

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize correctly with valid config', () => {
      const provider = new MidtransProvider({
        serverKey: mockServerKey,
        environment: 'sandbox',
      });

      expect(provider).toBeDefined();
    });

    it('should throw ConfigurationError when serverKey is missing', () => {
      expect(() => {
        new MidtransProvider({
          serverKey: '',
          environment: 'sandbox',
        });
      }).toThrow('API key is required');
    });

    it('should default to sandbox environment', () => {
      const provider = new MidtransProvider({
        serverKey: mockServerKey,
      });

      expect(provider).toBeDefined();
    });
  });

  describe('createInvoice', () => {
    it('should create invoice with valid params', async () => {
      const provider = new MidtransProvider({
        serverKey: mockServerKey,
        environment: 'sandbox',
      });

      // Mock fetch
      const mockResponse = {
        token: 'test-token-123',
        redirect_url: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/test-token-123',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const invoice = await provider.createInvoice({
        amount: 100000,
        currency: 'IDR',
        orderId: 'ORDER-123',
        customer: {
          name: 'Budi Santoso',
          email: 'budi@example.com',
          phone: '081234567890',
        },
      });

      expect(invoice).toBeDefined();
      expect(invoice.id).toBe('test-token-123');
      expect(invoice.orderId).toBe('ORDER-123');
      expect(invoice.amount).toBe(100000);
      expect(invoice.currency).toBe('IDR');
      expect(invoice.status).toBe('pending');
      expect(invoice.paymentUrl).toContain('midtrans');
    });

    it('should include items in request', async () => {
      const provider = new MidtransProvider({
        serverKey: mockServerKey,
        environment: 'sandbox',
      });

      let capturedBody: any;
      global.fetch = vi.fn().mockImplementation((_url, options) => {
        capturedBody = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              token: 'test-token',
              redirect_url: 'https://app.sandbox.midtrans.com/snap/v2/vtweb/test-token',
            }),
        });
      });

      await provider.createInvoice({
        amount: 200000,
        currency: 'IDR',
        orderId: 'ORDER-456',
        customer: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '081234567890',
        },
        items: [
          { id: 'item-1', name: 'Product A', price: 100000, quantity: 1 },
          { id: 'item-2', name: 'Product B', price: 100000, quantity: 1 },
        ],
      });

      expect(capturedBody.item_details).toBeDefined();
      expect(capturedBody.item_details).toHaveLength(2);
      expect(capturedBody.item_details[0].name).toBe('Product A');
    });
  });

  describe('getStatus', () => {
    it('should return payment status', async () => {
      const provider = new MidtransProvider({
        serverKey: mockServerKey,
        environment: 'sandbox',
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            transaction_id: 'txn-123',
            order_id: 'ORDER-123',
            transaction_status: 'settlement',
            gross_amount: '100000.00',
            payment_type: 'gopay',
            settlement_time: '2024-01-15 10:00:00',
          }),
      });

      const status = await provider.getStatus('ORDER-123');

      expect(status).toBeDefined();
      expect(status.id).toBe('txn-123');
      expect(status.orderId).toBe('ORDER-123');
      expect(status.status).toBe('paid');
      expect(status.amount).toBe(100000);
      expect(status.paymentMethod).toBe('gopay');
    });
  });

  describe('verifyWebhook', () => {
    it('should verify valid webhook signature', () => {
      const provider = new MidtransProvider({
        serverKey: mockServerKey,
        environment: 'sandbox',
      });

      const orderId = 'ORDER-123';
      const statusCode = '200';
      const grossAmount = '100000.00';

      // Generate valid signature
      const signature = crypto
        .createHash('sha512')
        .update(`${orderId}${statusCode}${grossAmount}${mockServerKey}`)
        .digest('hex');

      const body = {
        order_id: orderId,
        status_code: statusCode,
        gross_amount: grossAmount,
        signature_key: signature,
      };

      const isValid = provider.verifyWebhook(body);
      expect(isValid).toBe(true);
    });

    it('should reject invalid webhook signature', () => {
      const provider = new MidtransProvider({
        serverKey: mockServerKey,
        environment: 'sandbox',
      });

      const body = {
        order_id: 'ORDER-123',
        status_code: '200',
        gross_amount: '100000.00',
        signature_key: 'invalid-signature',
      };

      const isValid = provider.verifyWebhook(body);
      expect(isValid).toBe(false);
    });

    it('should return false when signature_key is missing', () => {
      const provider = new MidtransProvider({
        serverKey: mockServerKey,
        environment: 'sandbox',
      });

      const body = {
        order_id: 'ORDER-123',
        status_code: '200',
        gross_amount: '100000.00',
      };

      const isValid = provider.verifyWebhook(body);
      expect(isValid).toBe(false);
    });
  });

  describe('parseWebhook', () => {
    it('should parse webhook notification correctly', () => {
      const provider = new MidtransProvider({
        serverKey: mockServerKey,
        environment: 'sandbox',
      });

      const body = {
        order_id: 'ORDER-123',
        transaction_status: 'settlement',
        gross_amount: '100000.00',
        payment_type: 'qris',
        settlement_time: '2024-01-15 10:00:00',
      };

      const notification = provider.parseWebhook(body);

      expect(notification).toBeDefined();
      expect(notification.orderId).toBe('ORDER-123');
      expect(notification.status).toBe('paid');
      expect(notification.amount).toBe(100000);
      expect(notification.paymentMethod).toBe('qris');
      expect(notification.rawData).toEqual(body);
    });

    it('should map different transaction statuses correctly', () => {
      const provider = new MidtransProvider({
        serverKey: mockServerKey,
        environment: 'sandbox',
      });

      const testCases = [
        { midtransStatus: 'pending', expectedStatus: 'pending' },
        { midtransStatus: 'capture', expectedStatus: 'paid' },
        { midtransStatus: 'settlement', expectedStatus: 'paid' },
        { midtransStatus: 'deny', expectedStatus: 'failed' },
        { midtransStatus: 'cancel', expectedStatus: 'cancelled' },
        { midtransStatus: 'expire', expectedStatus: 'expired' },
        { midtransStatus: 'refund', expectedStatus: 'refunded' },
      ];

      testCases.forEach(({ midtransStatus, expectedStatus }) => {
        const notification = provider.parseWebhook({
          order_id: 'ORDER-123',
          transaction_status: midtransStatus,
          gross_amount: '100000.00',
        });

        expect(notification.status).toBe(expectedStatus);
      });
    });
  });
});
