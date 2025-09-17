const paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);
const Payment = require('../models/Payment');

// POST /api/payments/initialize
// body: { amount, currency?, email, shipmentId?, bidId?, meta? }
exports.initializePayment = async (req, res) => {
  try {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(503).json({ message: 'Payment service not configured' });
    }

    const { amount, currency = 'NGN', email, shipmentId, bidId, meta = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'amount (in kobo) is required and must be > 0' });
    }

    if (!email) {
      return res.status(400).json({ message: 'email is required' });
    }

    const reference = `pay_${Date.now()}_${req.user._id}`;

    const paystackResponse = await paystack.transaction.initialize({
      amount,
      email,
      currency,
      reference,
      metadata: {
        userId: req.user._id.toString(),
        shipmentId: shipmentId || '',
        bidId: bidId || '',
        ...Object.fromEntries(Object.entries(meta).map(([k, v]) => [k, String(v)]))
      }
    });

    if (!paystackResponse.status) {
      return res.status(400).json({ 
        message: 'Failed to initialize payment', 
        error: paystackResponse.message 
      });
    }

    await Payment.create({
      user: req.user._id,
      amount,
      currency,
      paystackReference: reference,
      paystackAccessCode: paystackResponse.data.access_code,
      status: 'pending',
      shipment: shipmentId || undefined,
      bid: bidId || undefined,
      meta
    });

    return res.json({ 
      authorizationUrl: paystackResponse.data.authorization_url,
      accessCode: paystackResponse.data.access_code,
      reference: paystackResponse.data.reference
    });
  } catch (err) {
    console.error('initializePayment error:', err);
    return res.status(500).json({ message: 'Failed to initialize payment', error: err.message });
  }
};

// POST /api/payments/verify
// body: { reference }
exports.verifyPayment = async (req, res) => {
  try {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(503).json({ message: 'Payment service not configured' });
    }

    const { reference } = req.body;
    if (!reference) return res.status(400).json({ message: 'reference is required' });

    const paystackResponse = await paystack.transaction.verify(reference);
    
    if (!paystackResponse.status) {
      return res.status(400).json({ 
        message: 'Payment verification failed', 
        error: paystackResponse.message 
      });
    }

    const payment = await Payment.findOneAndUpdate(
      { paystackReference: reference },
      { 
        status: paystackResponse.data.status === 'success' ? 'success' : 'failed',
        gatewayResponse: paystackResponse.data.gateway_response,
        channel: paystackResponse.data.channel,
        paidAt: paystackResponse.data.paid_at ? new Date(paystackResponse.data.paid_at) : null,
        authorizationCode: paystackResponse.data.authorization?.authorization_code,
        customerCode: paystackResponse.data.customer?.customer_code
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    return res.json({ success: true, payment, paystackData: paystackResponse.data });
  } catch (err) {
    console.error('verifyPayment error:', err);
    return res.status(500).json({ message: 'Failed to verify payment', error: err.message });
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
