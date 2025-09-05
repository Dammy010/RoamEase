const Stripe = require('stripe');
const Payment = require('../models/Payment');

// Initialize Stripe with fallback for development
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// POST /api/payments/create-intent
// body: { amount, currency?, shipmentId?, bidId?, meta? }
exports.createPaymentIntent = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ message: 'Payment service not configured' });
    }

    const { amount, currency = 'usd', shipmentId, bidId, meta = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'amount (in cents) is required and must be > 0' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: req.user._id.toString(),
        shipmentId: shipmentId || '',
        bidId: bidId || '',
        ...Object.fromEntries(Object.entries(meta).map(([k, v]) => [k, String(v)]))
      }
    });

    await Payment.create({
      user: req.user._id,
      amount,
      currency,
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending',
      shipment: shipmentId || undefined,
      bid: bidId || undefined,
      meta
    });

    return res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('createPaymentIntent error:', err);
    return res.status(500).json({ message: 'Failed to create payment intent', error: err.message });
  }
};

// POST /api/payments/confirm   (optional if client confirms with Stripe.js)
// body: { paymentIntentId }
exports.confirmPayment = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ message: 'Payment service not configured' });
    }

    const { paymentIntentId } = req.body;
    if (!paymentIntentId) return res.status(400).json({ message: 'paymentIntentId is required' });

    const pi = await stripe.paymentIntents.confirm(paymentIntentId);
    await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId },
      { status: pi.status },
      { new: true }
    );

    return res.json({ success: true, payment: pi });
  } catch (err) {
    console.error('confirmPayment error:', err);
    return res.status(500).json({ message: 'Failed to confirm payment', error: err.message });
  }
};

// GET /api/payments/history
exports.getPaymentHistory = async (req, res) => {
  try {
    const list = await Payment.find({ user: req.user._id })
      .populate('shipment', 'reference status')
      .populate('bid', 'amount status')
      .sort({ createdAt: -1 });

    return res.json(list);
  } catch (err) {
    console.error('getPaymentHistory error:', err);
    return res.status(500).json({ message: 'Failed to fetch payments', error: err.message });
  }
};
