import 'dotenv/config';
import open from 'open';
import readline from 'readline';
import { MidtransProvider } from './packages/midtrans/src';

async function main() {
  // Check if server key exists
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    console.error('Error: MIDTRANS_SERVER_KEY tidak ditemukan di .env file');
    console.log('\nBuat file .env dengan isi:');
    console.log('MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxx');
    process.exit(1);
  }

  console.log('='.repeat(50));
  console.log('Indo Payment SDK - Real API Test');
  console.log('='.repeat(50));
  console.log('\nEnvironment: sandbox');
  console.log('Server Key:', serverKey.substring(0, 20) + '...');

  // Initialize provider
  const midtrans = new MidtransProvider({
    serverKey,
    environment: 'sandbox',
    options: {
      enabledPayments: ['gopay', 'qris', 'bank_transfer', 'bca_va', 'bni_va', 'bri_va'],
    },
  });

  try {
    // Create unique order ID
    const orderId = `TEST-${Date.now()}`;

    console.log('\n[1/3] Membuat invoice...');
    console.log('Order ID:', orderId);

    const invoice = await midtrans.createInvoice({
      amount: 50000,
      currency: 'IDR',
      orderId,
      customer: {
        name: 'Budi Santoso',
        email: 'budi@example.com',
        phone: '081234567890',
      },
      items: [
        {
          id: 'ITEM-001',
          name: 'Test Product',
          price: 50000,
          quantity: 1,
        },
      ],
      expiresIn: 60, // 1 hour
    });

    console.log('\n[2/3] Invoice berhasil dibuat!');
    console.log('-'.repeat(50));
    console.log('Invoice ID:', invoice.id);
    console.log('Order ID:', invoice.orderId);
    console.log('Amount:', `Rp ${invoice.amount.toLocaleString('id-ID')}`);
    console.log('Status:', invoice.status);
    console.log('Expires At:', invoice.expiresAt.toLocaleString('id-ID'));
    console.log('\nPayment URL:');
    console.log(invoice.paymentUrl);
    console.log('-'.repeat(50));

    // Open payment URL in browser
    console.log('\nMembuka browser...');
    await open(invoice.paymentUrl);

    // Wait for user to complete payment
    console.log('\n[3/3] Selesaikan pembayaran di browser');
    console.log('     Gunakan Midtrans Simulator: https://simulator.sandbox.midtrans.com/\n');

    await waitForEnter('Tekan ENTER setelah selesai bayar...');

    console.log('\nMengecek status pembayaran...\n');

    // Check status
    const status = await midtrans.getStatus(orderId);

    console.log('\nStatus Pembayaran:');
    console.log('-'.repeat(50));
    console.log('Transaction ID:', status.id || '(belum ada)');
    console.log('Order ID:', status.orderId);
    console.log('Status:', status.status);
    console.log('Amount:', status.amount ? `Rp ${status.amount.toLocaleString('id-ID')}` : '(belum ada)');
    if (status.paymentMethod) {
      console.log('Payment Method:', status.paymentMethod);
    }
    if (status.paidAt) {
      console.log('Paid At:', status.paidAt.toLocaleString('id-ID'));
    }
    console.log('-'.repeat(50));

    console.log('\nTest selesai!');

  } catch (error) {
    console.error('\nError:', error);
  }
}

function waitForEnter(prompt: string): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, () => {
      rl.close();
      resolve();
    });
  });
}

main();
