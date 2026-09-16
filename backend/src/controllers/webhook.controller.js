const stripe = require('../config/stripe');
const env = require('../config/env');
const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');

const handleStripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    let orderIds = [];

    try {
      orderIds = JSON.parse(session.metadata?.orderIds || '[]');
    } catch {
      console.error('Invalid orderIds metadata on Stripe session', session.id);
    }

    if (Array.isArray(orderIds) && orderIds.length > 0) {
      await prisma.order.updateMany({
        where: { id: { in: orderIds } },
        data: { isPaid: true },
      });
    }
  }

  // Always acknowledge to Stripe
  return res.status(200).json({ received: true });
});

module.exports = { handleStripeWebhook };
