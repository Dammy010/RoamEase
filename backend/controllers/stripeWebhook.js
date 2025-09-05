const Stripe = require('stripe');
const Payment = require('../models/Payment');

// Initialize Stripe with fallback for development
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// POST /api/payments/webhook  (Public; uses express.raw in route)
exports.stripeWebhook = async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ message: 'Payment service not configured' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object;
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: intent.id },
          {
            status: 'succeeded',
            receiptUrl: intent.charges?.data?.[0]?.receipt_url || null
          },
          { new: true }
        );
        // TODO: If needed, trigger business actions (e.g., activate subscription, mark bid paid)
        break;
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object;
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: intent.id },
          { status: 'failed' },
          { new: true }
        );
        break;
      }

      // Handle more events as needed…
      default:
        // console.log(`Unhandled event type ${event.type}`);
        break;
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('stripeWebhook handler error:', err);
    return res.status(500).send(`Webhook handler error: ${err.message}`);
  }
};
