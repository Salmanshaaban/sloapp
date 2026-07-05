export function createPayPalPayoutRequest(amount: number, accountDetails: string) {
  const clientId = process.env.PAYPAL_CLIENT_ID || '';
  const secret = process.env.PAYPAL_CLIENT_SECRET || '';
  if (!clientId || !secret) {
    throw new Error('PayPal credentials missing');
  }
  return {
    status: 'created',
    provider: 'paypal',
    amount,
    accountDetails,
    createdAt: new Date().toISOString(),
  };
}
