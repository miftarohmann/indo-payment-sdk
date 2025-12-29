# Indo Payment SDK

> Unified Payment Gateway SDK untuk Indonesia - Beautiful, Type-Safe, Simple.

## Quick Start

```bash
pnpm add @indo-payment/midtrans
```

```typescript
import { MidtransProvider } from '@indo-payment/midtrans';

const payment = new MidtransProvider({
  serverKey: 'your-server-key',
  environment: 'sandbox',
});

const invoice = await payment.createInvoice({
  amount: 100000,
  currency: 'IDR',
  orderId: 'ORDER-123',
  customer: {
    name: 'Budi Santoso',
    email: 'budi@example.com',
    phone: '081234567890',
  },
});

console.log('Bayar di sini:', invoice.paymentUrl);
```

## Features

- **Unified API** - Interface yang sama untuk semua payment gateway
- **Type Safe** - Full TypeScript support
- **Modern** - ESM & CJS support
- **Well Tested** - Comprehensive test coverage
- **Indonesian First** - Dibuat untuk developer Indonesia

## Packages

- `@indo-payment/core` - Core types dan abstractions
- `@indo-payment/midtrans` - Midtrans provider
- `@indo-payment/xendit` - Xendit provider (coming soon)

## Development

```bash
# Install dependencies
pnpm install

# Build semua packages
pnpm build

# Run tests
pnpm test

# Run example
cd examples/basic
pnpm start
```

## License

MIT
