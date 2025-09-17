const Subscription = require("../models/Subscription");
const User = require("../models/User");
const Payment = require("../models/Payment");
const paystack = require("paystack")(process.env.PAYSTACK_SECRET_KEY);

// Create a new subscription
const createSubscription = async (req, res) => {
  try {
    const { billingCycle, plan = "basic" } = req.body;
    const userId = req.user._id;

    // Validate billing cycle
    if (!["weekly", "monthly", "yearly"].includes(billingCycle)) {
      return res.status(400).json({
        success: false,
        message: "Invalid billing cycle. Must be weekly, monthly, or yearly.",
      });
    }

    // Validate plan
    if (!["basic", "premium", "enterprise"].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan. Must be basic, premium, or enterprise.",
      });
    }

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      user: userId,
      status: "active",
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: "You already have an active subscription.",
      });
    }

    // Calculate pricing based on plan and billing cycle (in Naira)
    const pricing = {
      basic: {
        weekly: { price: 15600, originalPrice: 20000 }, // ₦156
        monthly: { price: 45600, originalPrice: 60000 }, // ₦456
        yearly: { price: 119600, originalPrice: 187200 }, // ₦1,196
      },
      premium: {
        weekly: { price: 25600, originalPrice: 32000 }, // ₦256
        monthly: { price: 65600, originalPrice: 82000 }, // ₦656
        yearly: { price: 319600, originalPrice: 475200 }, // ₦3,196
      },
      enterprise: {
        weekly: { price: 40600, originalPrice: 50000 }, // ₦406
        monthly: { price: 150600, originalPrice: 190000 }, // ₦1,506
        yearly: { price: 799600, originalPrice: 1195200 }, // ₦7,996
      },
    };

    const currentPricing = pricing[plan][billingCycle];
    const amountInKobo = currentPricing.price * 100; // Convert to kobo for Paystack

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(503).json({
        success: false,
        message:
          "Payment service not configured - PAYSTACK_SECRET_KEY not found",
      });
    }

    // Get user details for Paystack
    const user = await User.findById(userId).select("name email phoneNumber");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create Paystack transaction with retry mechanism for duplicate references
    let paystackResponse;
    let reference;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++; // Increment attempts at the start of each loop

      // Generate unique reference with multiple random components and process ID
      const timestamp = Date.now();
      const random1 = Math.random().toString(36).substring(2, 15);
      const random2 = Math.random().toString(36).substring(2, 15);
      const random3 = Math.random().toString(36).substring(2, 10);
      const random4 = Math.random().toString(36).substring(2, 8);
      const processId = process.pid || Math.floor(Math.random() * 10000);
      const attemptSuffix = attempts > 1 ? `_retry${attempts}` : "";
      const nanoTime = process.hrtime.bigint().toString();
      reference = `sub_${timestamp}_${userId}_${random1}_${random2}_${random3}_${random4}_${processId}_${nanoTime.substring(
        nanoTime.length - 6
      )}${attemptSuffix}`;

      console.log(
        `Attempt ${attempts}: Creating subscription with reference:`,
        reference
      );
      console.log("Amount:", amountInKobo, "kobo");
      console.log("User email:", user.email);
      console.log("Timestamp:", timestamp);
      console.log("Process ID:", processId);

      // Check if reference already exists in our database
      const existingSubscription = await Subscription.findOne({
        paystackReference: reference,
      });
      if (existingSubscription) {
        console.log(
          `Reference ${reference} already exists in database, generating new one...`
        );
        continue;
      }

      try {
        paystackResponse = await paystack.transaction.initialize({
          amount: amountInKobo,
          email: user.email,
          currency: "NGN",
          reference: reference,
          metadata: {
            userId: userId.toString(),
            plan: plan,
            billingCycle: billingCycle,
            userName: user.name,
          },
        });

        if (paystackResponse.status) {
          console.log("Paystack transaction initialized successfully");
          break; // Success, exit the retry loop
        }

        // Check if it's a duplicate reference error
        if (
          paystackResponse.message &&
          paystackResponse.message.includes("Duplicate")
        ) {
          console.log(
            `❌ Duplicate reference detected on attempt ${attempts}:`,
            paystackResponse.message
          );
          console.log(`Reference that failed: ${reference}`);
          if (attempts >= maxAttempts) {
            console.log(
              `❌ Max attempts (${maxAttempts}) reached for duplicate reference`
            );
            return res.status(400).json({
              success: false,
              message:
                "Unable to generate unique transaction reference after multiple attempts. Please try again.",
              error: "DUPLICATE_REFERENCE_MAX_RETRIES",
            });
          }
          // Wait a bit before retrying
          console.log(
            `⏳ Waiting 200ms before retry attempt ${attempts + 1}...`
          );
          await new Promise((resolve) => setTimeout(resolve, 200));
          continue;
        }

        // Other Paystack error
        console.error("Paystack error:", paystackResponse.message);
        return res.status(400).json({
          success: false,
          message: "Failed to initialize payment",
          error: paystackResponse.message,
        });
      } catch (error) {
        console.error("Paystack API error:", error);
        if (attempts >= maxAttempts) {
          return res.status(500).json({
            success: false,
            message: "Payment service error after multiple attempts",
            error: error.message,
          });
        }
        // Wait a bit before retrying
        await new Promise((resolve) => setTimeout(resolve, 200));
        continue;
      }
    }

    // Create subscription record
    const subscription = new Subscription({
      user: userId,
      plan: plan,
      billingCycle: billingCycle,
      amount: currentPricing.price,
      currency: "NGN",
      paymentId: paystackResponse.data.reference,
      paystackReference: paystackResponse.data.reference,
      status: "inactive", // Will be activated when payment is confirmed
      currentPeriodStart: new Date(),
      currentPeriodEnd: calculatePeriodEnd(billingCycle),
      metadata: {
        originalPrice: currentPricing.originalPrice,
        discount: Math.round(
          (1 - currentPricing.price / currentPricing.originalPrice) * 100
        ),
      },
    });

    await subscription.save();

    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: {
        subscription: subscription,
        authorizationUrl: paystackResponse.data.authorization_url,
        accessCode: paystackResponse.data.access_code,
        reference: paystackResponse.data.reference,
      },
    });
  } catch (error) {
    console.error("Create subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating subscription",
      error: error.message,
    });
  }
};

// Confirm subscription payment
const confirmSubscription = async (req, res) => {
  try {
    const { reference } = req.body;
    const userId = req.user._id;

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(503).json({
        success: false,
        message: "Payment service not configured",
      });
    }

    // Verify payment with Paystack
    const paystackResponse = await paystack.transaction.verify(reference);

    if (
      !paystackResponse.status ||
      paystackResponse.data.status !== "success"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment not completed or failed",
        error: paystackResponse.message,
      });
    }

    // Find and update subscription
    const subscription = await Subscription.findOne({
      user: userId,
      paystackReference: reference,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Update subscription status
    subscription.status = "active";
    subscription.paystackSubscriptionCode =
      paystackResponse.data.authorization?.authorization_code;
    await subscription.save();

    // Create payment record
    await Payment.create({
      user: userId,
      amount: subscription.amount * 100, // Convert to kobo
      currency: subscription.currency,
      paystackReference: reference,
      status: "success",
      gatewayResponse: paystackResponse.data.gateway_response,
      channel: paystackResponse.data.channel,
      paidAt: new Date(paystackResponse.data.paid_at),
      authorizationCode:
        paystackResponse.data.authorization?.authorization_code,
      customerCode: paystackResponse.data.customer?.customer_code,
      meta: {
        plan: subscription.plan,
        billingCycle: subscription.billingCycle,
      },
    });

    res.json({
      success: true,
      message: "Subscription activated successfully",
      data: subscription,
    });
  } catch (error) {
    console.error("Confirm subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Error confirming subscription",
      error: error.message,
    });
  }
};

// Get user subscriptions
const getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.user._id;

    const subscriptions = await Subscription.find({ user: userId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    console.error("Get user subscriptions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching subscriptions",
      error: error.message,
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
      user: userId,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    if (subscription.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Subscription is already cancelled",
      });
    }

    if (subscription.status === "expired") {
      return res.status(400).json({
        success: false,
        message: "Subscription has already expired",
      });
    }

    // Update subscription status
    subscription.status = "cancelled";
    subscription.cancelledAt = new Date();
    await subscription.save();

    res.json({
      success: true,
      message: "Subscription cancelled successfully",
      data: subscription,
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling subscription",
      error: error.message,
    });
  }
};

// Helper function to calculate period end
const calculatePeriodEnd = (billingCycle) => {
  const now = new Date();
  switch (billingCycle) {
    case "weekly":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "monthly":
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    case "yearly":
      return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    default:
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Default to monthly
  }
};

module.exports = {
  createSubscription,
  confirmSubscription,
  getUserSubscriptions,
  cancelSubscription,
};
