<div align="center">

# Indo Payment SDK

[![npm version](https://img.shields.io/npm/v/@indo-payment/core.svg?style=flat-square)](https://www.npmjs.com/package/@indo-payment/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

**Unified Payment Gateway SDK for Indonesia**

*One SDK to rule them all. Beautiful, type-safe, and simple.*

[Getting Started](#-quick-start) •
[Documentation](#-documentation) •
[Examples](#-examples) •
[Contributing](#-contributing)

</div>

---

## Why Indo Payment SDK?

Integrating payment gateways in Indonesia shouldn't be hard. Each provider has different APIs, different response formats, and different documentation quality. **Indo Payment SDK** solves this by providing a unified, type-safe interface for all major Indonesian payment gateways.

```typescript
// Same interface, any provider
const invoice = await payment.createInvoice({
  amount: 100000,
  currency: 'IDR',
  orderId: 'ORDER-123',
  customer: { name: 'Budi', email: 'budi@example.com', phone: '081234567890' }
});

console.log(invoice.paymentUrl); // Send this to your customer
```

### Key Features

- **Unified API** - Same interface for Midtrans, Xendit, and more
- **Type-Safe** - Full TypeScript support with autocomplete
- **Modern** - ESM & CommonJS support, tree-shakeable
- **Well Tested** - Unit tests + real API integration tests
- **Production Ready** - Used in real applications

---

## Real Payment Proof

> **Tested with real Midtrans Sandbox API** - Not just mock tests!

<br>

### Step 1: Create Invoice

```typescript
const invoice = await midtrans.createInvoice({
  amount: 50000,
  currency: 'IDR',
  orderId: 'TEST-1735530073996',
  customer: {
    name: 'Budi Santoso',
    email: 'budi@example.com',
    phone: '081234567890',
  },
  items: [{ id: 'ITEM-001', name: 'Test Product', price: 50000, quantity: 1 }],
});
```

<br>

### Step 2: Customer Completes Payment

The SDK automatically opens the payment page. Customer selects payment method and completes the transaction.

<div align="center">

![Payment Success](docs/screenshots/payment-success.png)

*Midtrans Snap payment page - Customer successfully paid via QRIS/GoPay*

</div>

<br>

### Step 3: Verify Payment Status

```typescript
const status = await midtrans.getStatus('TEST-1735530073996');
console.log(status);
```

<div align="center">

![API Response](docs/screenshots/terminal-response.png)

*Terminal showing successful payment verification*

</div>

<br>

### Transaction Details

| Field | Value |
|-------|-------|
| **Order ID** | `TEST-1735530073996` |
| **Amount** | Rp 50.000 |
| **Status** | `paid` ✅ |
| **Payment Method** | QRIS |
| **Transaction ID** | `ed2cbb6f-3280-4ed7-a112-xxxxxxxx` |
| **Settlement Time** | 2024-12-30 08:42:17 |

<br>

> 💡 **Note:** This was tested using [Midtrans Sandbox Simulator](https://simulator.sandbox.midtrans.com/) with real API calls.

---

## Supported Providers

| Provider | Status | Features |
|----------|--------|----------|
| **Midtrans** | Ready | Snap API, QRIS, GoPay, Bank Transfer, Credit Card |
| **Xendit** | Coming Soon | Invoice, Virtual Account, eWallet, QR Code |
| **Tripay** | Planned | - |
| **Duitku** | Planned | - |

---

## Quick Start

### Installation

```bash
# Using pnpm (recommended)
pnpm add @indo-payment/midtrans

# Using npm
npm install @indo-payment/midtrans

# Using yarn
yarn add @indo-payment/midtrans
```

### Basic Usage

```typescript
import { MidtransProvider } from '@indo-payment/midtrans';

// Initialize the provider
const midtrans = new MidtransProvider({
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  environment: 'sandbox', // or 'production'
  options: {
    enabledPayments: ['gopay', 'qris', 'bank_transfer'],
  },
});

// Create a payment invoice
const invoice = await midtrans.createInvoice({
  amount: 100000,
  currency: 'IDR',
  orderId: `ORDER-${Date.now()}`,
  customer: {
    name: 'Budi Santoso',
    email: 'budi@example.com',
    phone: '081234567890',
  },
  items: [
    {
      id: 'ITEM-001',
      name: 'Product A',
      price: 100000,
      quantity: 1,
    },
  ],
  expiresIn: 60, // minutes
});

console.log('Payment URL:', invoice.paymentUrl);
console.log('Order ID:', invoice.orderId);

// Check payment status
const status = await midtrans.getStatus(invoice.orderId);
console.log('Status:', status.status); // 'pending' | 'paid' | 'failed' | etc.
```

### Handling Webhooks

```typescript
import express from 'express';
import { MidtransProvider } from '@indo-payment/midtrans';

const app = express();
const midtrans = new MidtransProvider({ serverKey: process.env.MIDTRANS_SERVER_KEY! });

app.post('/webhook/midtrans', express.json(), (req, res) => {
  // Verify webhook signature
  const isValid = midtrans.verifyWebhook(req.body);

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Parse the notification
  const notification = midtrans.parseWebhook(req.body);

  console.log('Order ID:', notification.orderId);
  console.log('Status:', notification.status);
  console.log('Payment Method:', notification.paymentMethod);

  // Update your order status in database
  // await updateOrderStatus(notification.orderId, notification.status);

  res.json({ received: true });
});
```

---

## API Reference

### `createInvoice(params)`

Creates a new payment invoice.

```typescript
interface CreateInvoiceParams {
  amount: number;           // Payment amount
  currency: Currency;       // 'IDR' | 'USD' | 'SGD' | 'MYR'
  orderId: string;          // Your unique order ID
  customer: CustomerInfo;   // Customer details
  items?: InvoiceItem[];    // Line items (optional)
  metadata?: Record<string, any>;  // Custom data (optional)
  expiresIn?: number;       // Minutes until expiry (optional)
  successUrl?: string;      // Redirect URL after payment (optional)
  failureUrl?: string;      // Redirect URL on failure (optional)
}
```

**Returns:** `Promise<Invoice>`

### `getStatus(orderId)`

Check the status of a payment.

```typescript
const status = await provider.getStatus('ORDER-123');
// Returns: PaymentStatusResponse
```

### `verifyWebhook(body, headers?)`

Verify webhook signature from payment provider.

```typescript
const isValid = provider.verifyWebhook(req.body, req.headers);
// Returns: boolean
```

### `parseWebhook(body)`

Parse webhook notification into a standardized format.

```typescript
const notification = provider.parseWebhook(req.body);
// Returns: WebhookNotification
```

---

## Payment Status

All providers use a unified status enum:

| Status | Description |
|--------|-------------|
| `pending` | Payment created, waiting for customer |
| `processing` | Payment is being processed |
| `paid` | Payment successful |
| `failed` | Payment failed |
| `expired` | Payment link expired |
| `refunded` | Payment was refunded |
| `cancelled` | Payment was cancelled |

---

## Examples

### Next.js API Route

```typescript
// pages/api/create-payment.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { MidtransProvider } from '@indo-payment/midtrans';

const midtrans = new MidtransProvider({
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, orderId, customer } = req.body;

  const invoice = await midtrans.createInvoice({
    amount,
    currency: 'IDR',
    orderId,
    customer,
  });

  res.json({
    paymentUrl: invoice.paymentUrl,
    orderId: invoice.orderId,
  });
}
```

### Express.js

```typescript
import express from 'express';
import { MidtransProvider } from '@indo-payment/midtrans';

const app = express();
const midtrans = new MidtransProvider({
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
});

app.post('/api/payments', express.json(), async (req, res) => {
  const invoice = await midtrans.createInvoice(req.body);
  res.json(invoice);
});

app.get('/api/payments/:orderId', async (req, res) => {
  const status = await midtrans.getStatus(req.params.orderId);
  res.json(status);
});

app.listen(3000);
```

---

## Development

```bash
# Clone the repository
git clone https://github.com/miftarohman/indo-payment-sdk.git
cd indo-payment-sdk

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run real API test (requires .env)
pnpm test:real
```

### Environment Variables

Create a `.env` file for testing:

```env
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxx
```

Get your sandbox keys from [Midtrans Dashboard](https://dashboard.sandbox.midtrans.com/settings/config_info).

---

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Roadmap

- [x] Core package with unified types
- [x] Midtrans provider (Snap API)
- [ ] Xendit provider
- [ ] Tripay provider
- [ ] Retry logic & error handling improvements
- [ ] React hooks package
- [ ] Documentation website

---

## License

[MIT](LICENSE) © 2025 Mifta Rohman

---

<div align="center">

**Built with ❤️ for Indonesian developers**

[Report Bug](https://github.com/miftarohman/indo-payment-sdk/issues) •
[Request Feature](https://github.com/miftarohman/indo-payment-sdk/issues)

</div>
