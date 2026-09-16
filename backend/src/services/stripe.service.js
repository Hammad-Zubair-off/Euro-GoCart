const stripe = require('../config/stripe');
const env = require('../config/env');

/**
 * Create a Stripe Checkout Session for one or more order totals.
 * Currency is EUR to match the Euro GoCart brand.
 */
async function createCheckoutSession({ orderIds, totalAmount, customerEmail }) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: customerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(totalAmount * 100), // Stripe expects cents
          product_data: {
            name: 'Euro GoCart Order',
            description: `Order(s): ${orderIds.join(', ')}`,
          },
        },
      },
    ],
    metadata: {
      orderIds: JSON.stringify(orderIds),
    },
    success_url: `${env.FRONTEND_URL}/orders`,
    cancel_url: `${env.FRONTEND_URL}/cart`,
  });

  return session;
}

module.exports = { createCheckoutSession };
