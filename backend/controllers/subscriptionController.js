const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Stripe = require('stripe');

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Create a new subscription
const createSubscription = async (req, res) => {
  try {
    const { billingCycle } = req.body;
    const userId = req.user._id;

    // Validate billing cycle
    if (!['weekly', 'monthly', 'yearly'].includes(billingCycle)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid billing cycle. Must be weekly, monthly, or yearly.'
      });
    }

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      user: userId,
      status: 'active'
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active subscription.'
      });
    }

    // Calculate pricing based on billing cycle
    const pricing = {
      weekly: { price: 9, originalPrice: 12 },
      monthly: { price: 29, originalPrice: 39 },
      yearly: { price: 299, originalPrice: 468 }
    };

    const currentPricing = pricing[billingCycle];
    const amountInCents = currentPricing.price * 100; // Convert to cents for Stripe

    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Payment service not configured'
      });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: userId.toString(),
        plan: 'basic',
        billingCycle: billingCycle
      }
    });

    // Create subscription record
    const subscription = new Subscription({
      user: userId,
      plan: 'basic',
      billingCycle: billingCycle,
      amount: currentPricing.price,
      currency: 'usd',
      paymentId: paymentIntent.id,
      status: 'inactive', // Will be activated when payment is confirmed
      currentPeriodStart: new Date(),
      currentPeriodEnd: calculatePeriodEnd(billingCycle),
      metadata: {
        originalPrice: currentPricing.originalPrice,
        discount: Math.round((1 - currentPricing.price / currentPricing.originalPrice) * 100)
      }
    });

    await subscription.save();

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: {
        subscription: subscription,
        clientSecret: paymentIntent.client_secret
      }
    });

  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating subscription',
      error: error.message
    });
  }
};

// Confirm subscription payment
const confirmSubscription = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const userId = req.user._id;

    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Payment service not configured'
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

    // Find and update subscription
    const subscription = await Subscription.findOne({
      user: userId,
      paymentId: paymentIntentId
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Update subscription status
    subscription.status = 'active';
    subscription.stripeSubscriptionId = paymentIntent.id;
    await subscription.save();

    // Create payment record
    await Payment.create({
      user: userId,
      amount: subscription.amount * 100, // Convert to cents
      currency: subscription.currency,
      stripePaymentIntentId: paymentIntentId,
      status: 'succeeded',
      meta: {
        plan: subscription.plan,
        billingCycle: subscription.billingCycle
      }
    });

    res.json({
      success: true,
      message: 'Subscription activated successfully',
      data: subscription
    });

  } catch (error) {
    console.error('Confirm subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming subscription',
      error: error.message
    });
  }
};

// Get user subscriptions
const getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.user._id;

    const subscriptions = await Subscription.find({ user: userId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: subscriptions
    });

  } catch (error) {
    console.error('Get user subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscriptions',
      error: error.message
    });
  }
};

// Cancel subscription
const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const userId = req.user._id;

    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      user: userId
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Subscription is not active'
      });
    }

    // Update subscription status
    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: subscription
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling subscription',
      error: error.message
    });
  }
};

// Helper function to calculate period end
const calculatePeriodEnd = (billingCycle) => {
  const now = new Date();
  switch (billingCycle) {
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    case 'yearly':
      return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    default:
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Default to monthly
  }
};

module.exports = {
  createSubscription,
  confirmSubscription,
  getUserSubscriptions,
  cancelSubscription
};
