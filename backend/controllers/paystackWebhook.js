const crypto = require('crypto');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');

// Verify Paystack webhook signature
const verifyPaystackSignature = (req, res, next) => {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(400).json({ message: 'Invalid signature' });
  }

  next();
};

// Handle Paystack webhook events
const handlePaystackWebhook = async (req, res) => {
  try {
    const event = req.body;

    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(event.data);
        break;
      
      case 'charge.failed':
        await handleFailedPayment(event.data);
        break;
      
      case 'subscription.create':
        await handleSubscriptionCreated(event.data);
        break;
      
      case 'subscription.disable':
        await handleSubscriptionDisabled(event.data);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    res.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

// Handle successful payment
const handleSuccessfulPayment = async (data) => {
  try {
    const payment = await Payment.findOneAndUpdate(
      { paystackReference: data.reference },
      {
        status: 'success',
        gatewayResponse: data.gateway_response,
        channel: data.channel,
        paidAt: new Date(data.paid_at),
        authorizationCode: data.authorization?.authorization_code,
        customerCode: data.customer?.customer_code,
        receiptUrl: data.receipt?.url
      },
      { new: true }
    );

    if (payment) {
      console.log(`Payment ${data.reference} marked as successful`);
      
      // If this is a subscription payment, activate the subscription
      if (payment.meta?.plan) {
        await Subscription.findOneAndUpdate(
          { paystackReference: data.reference },
          { 
            status: 'active',
            paystackSubscriptionCode: data.authorization?.authorization_code
          }
        );
        console.log(`Subscription activated for payment ${data.reference}`);
      }
    }
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
};

// Handle failed payment
const handleFailedPayment = async (data) => {
  try {
    await Payment.findOneAndUpdate(
      { paystackReference: data.reference },
      {
        status: 'failed',
        gatewayResponse: data.gateway_response,
        channel: data.channel
      }
    );

    console.log(`Payment ${data.reference} marked as failed`);
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
};

// Handle subscription created
const handleSubscriptionCreated = async (data) => {
  try {
    await Subscription.findOneAndUpdate(
      { paystackReference: data.subscription?.invoice?.reference },
      {
        paystackSubscriptionCode: data.subscription.subscription_code,
        status: 'active'
      }
    );

    console.log(`Subscription created: ${data.subscription.subscription_code}`);
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
};

// Handle subscription disabled
const handleSubscriptionDisabled = async (data) => {
  try {
    await Subscription.findOneAndUpdate(
      { paystackSubscriptionCode: data.subscription.subscription_code },
      {
        status: 'cancelled',
        cancelledAt: new Date()
      }
    );

    console.log(`Subscription disabled: ${data.subscription.subscription_code}`);
  } catch (error) {
    console.error('Error handling subscription disabled:', error);
  }
};

module.exports = {
  verifyPaystackSignature,
  handlePaystackWebhook
};
