import { MidtransProvider } from '@indo-payment/midtrans';

async function main() {
  // Initialize provider
  const midtrans = new MidtransProvider({
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    environment: 'sandbox',
    options: {
      enabledPayments: ['gopay', 'qris', 'bank_transfer'],
    },
  });

  try {
    // Create invoice
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
          name: 'Product A',
          price: 100000,
          quantity: 1,
        },
      ],
      expiresIn: 60, // 1 hour
    });

    console.log('Invoice berhasil dibuat!');
    console.log('Payment URL:', invoice.paymentUrl);
    console.log('Order ID:', invoice.orderId);
    console.log('Status:', invoice.status);
    console.log('Expires At:', invoice.expiresAt);

    // Later: check status
    console.log('\nMengecek status pembayaran dalam 5 detik...');
    setTimeout(async () => {
      const status = await midtrans.getStatus(invoice.orderId);
      console.log('Payment status:', status.status);
    }, 5000);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
