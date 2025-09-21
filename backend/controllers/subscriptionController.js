const Subscription = require("../models/Subscription");
const User = require("../models/User");
const Payment = require("../models/Payment");
const paystack = require("paystack")(process.env.PAYSTACK_SECRET_KEY);
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

// In-memory cache to track used references
const usedReferences = new Set();

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

    // Clean up any old failed subscriptions first (more aggressive cleanup)
    try {
      const cleanupResult = await Subscription.deleteMany({
        user: userId,
        status: "pending",
        createdAt: { $lte: new Date(Date.now() - 1 * 60 * 1000) }, // Older than 1 minute
      });
      console.log(
        `🧹 Cleaned up ${cleanupResult.deletedCount} old failed subscriptions`
      );
    } catch (cleanupError) {
      console.error("Error cleaning up old subscriptions:", cleanupError);
    }

    // Generate a completely unique reference using multiple strategies
    let paystackResponse;
    let reference;
    let attempts = 0;
    const maxAttempts = 10; // Increased attempts for better success rate

    while (attempts < maxAttempts) {
      attempts++;

      // Strategy 1: Use crypto.randomUUID if available, fallback to uuid
      let uuid;
      try {
        uuid = crypto.randomUUID();
      } catch (e) {
        uuid = uuidv4();
      }

      // Strategy 2: Use multiple entropy sources
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 12);
      const processId = process.pid || Math.floor(Math.random() * 10000);
      const nanoTime = process.hrtime.bigint().toString();
      const sessionId = Math.random().toString(36).substring(2, 10);
      const attemptId = attempts.toString().padStart(2, "0");

      // Strategy 3: Use a completely different format with maximum entropy
      reference = `roamease_${timestamp}_${uuid.replace(
        /-/g,
        ""
      )}_${randomSuffix}_${processId}_${nanoTime.substring(
        nanoTime.length - 8
      )}_${sessionId}_${attemptId}`;

      console.log(
        `Attempt ${attempts}: Creating subscription with reference:`,
        reference
      );
      console.log("Amount:", amountInKobo, "kobo");
      console.log("User email:", user.email);
      console.log("Reference length:", reference.length);

      // Check if reference was already used in this session
      if (usedReferences.has(reference)) {
        console.log(
          `Reference ${reference} already used in this session, generating new one...`
        );
        await new Promise((resolve) => setTimeout(resolve, 100));
        continue;
      }

      // Check if reference already exists in our database
      const existingSubscription = await Subscription.findOne({
        paystackReference: reference,
      });
      if (existingSubscription) {
        console.log(
          `Reference ${reference} already exists in database, generating new one...`
        );
        await new Promise((resolve) => setTimeout(resolve, 100));
        continue;
      }

      // Add to used references cache
      usedReferences.add(reference);

      // Skip Paystack verification to avoid API calls that might cause issues
      // We'll rely on the uniqueness of our reference generation

      try {
        // For inline popup, we don't need to initialize a transaction
        // We just need to return the reference and amount for the frontend
        console.log("Creating subscription with reference:", reference);
        console.log("Amount in kobo:", amountInKobo);
        console.log("User email:", user.email);

        // Simulate successful response for inline popup
        paystackResponse = {
          status: true,
          message: "Reference generated successfully",
          data: {
            reference: reference,
            amount: amountInKobo,
            email: user.email,
          },
        };

        if (paystackResponse.status) {
          console.log("Reference generated successfully for inline popup");
          break; // Success, exit the retry loop
        }

        // Check if it's a duplicate reference error
        if (
          paystackResponse.message &&
          (paystackResponse.message.includes("Duplicate") ||
            paystackResponse.message.includes("duplicate_reference"))
        ) {
          console.log(
            `❌ Duplicate reference detected on attempt ${attempts}:`,
            paystackResponse.message
          );
          console.log(`Reference that failed: ${reference}`);

          // Remove from used references cache
          usedReferences.delete(reference);

          // Clean up failed subscription records immediately
          try {
            await Subscription.deleteMany({
              user: userId,
              status: "pending",
              paystackReference: { $exists: true },
              createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }, // Last 15 minutes
            });
            console.log("🧹 Cleaned up failed subscription records");
          } catch (cleanupError) {
            console.error(
              "Error cleaning up failed subscriptions:",
              cleanupError
            );
          }

          if (attempts >= maxAttempts) {
            console.log(
              `❌ Max attempts (${maxAttempts}) reached for duplicate reference`
            );

            // Final cleanup attempt
            try {
              await Subscription.deleteMany({
                user: userId,
                status: "pending",
              });
              console.log("🧹 Final cleanup of all pending subscriptions");
            } catch (finalCleanupError) {
              console.error("Final cleanup error:", finalCleanupError);
            }

            return res.status(400).json({
              success: false,
              message:
                "Unable to generate unique transaction reference after multiple attempts. Please try again in a few minutes.",
              error: "DUPLICATE_REFERENCE_MAX_RETRIES",
            });
          }
          // Wait longer before retrying
          console.log(
            `⏳ Waiting 1000ms before retry attempt ${attempts + 1}...`
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
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
        reference: paystackResponse.data.reference,
        amount: currentPricing.price,
        // For inline popup, we return the data needed for PaystackPop.setup
        paystackData: {
          key: process.env.PAYSTACK_PUBLIC_KEY,
          email: user.email,
          amount: currentPricing.price * 100, // Convert to kobo
          ref: paystackResponse.data.reference,
          currency: "NGN",
          metadata: {
            userId: userId.toString(),
            plan: plan,
            billingCycle: billingCycle,
            userName: user.name,
          },
        },
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
    console.log("🔍 Backend: Getting subscriptions for user:", userId);

    const subscriptions = await Subscription.find({ user: userId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    console.log("🔍 Backend: Found subscriptions:", subscriptions.length);
    console.log(
      "🔍 Backend: Subscription statuses:",
      subscriptions.map((sub) => ({
        id: sub._id,
        status: sub.status,
        plan: sub.plan,
      }))
    );

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

// Clean up failed subscriptions (admin utility)
const cleanupFailedSubscriptions = async (req, res) => {
  try {
    // Clean up all pending subscriptions older than 5 minutes
    const result = await Subscription.deleteMany({
      status: "pending",
      paystackReference: { $exists: true },
      createdAt: { $lte: new Date(Date.now() - 5 * 60 * 1000) }, // Older than 5 minutes
    });

    console.log(
      `🧹 Cleaned up ${result.deletedCount} failed subscription records`
    );

    res.json({
      success: true,
      message: `Cleaned up ${result.deletedCount} failed subscription records`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Cleanup failed subscriptions error:", error);
    res.status(500).json({
      success: false,
      message: "Error cleaning up failed subscriptions",
      error: error.message,
    });
  }
};

// Emergency cleanup - remove ALL pending subscriptions (use with caution)
const emergencyCleanup = async (req, res) => {
  try {
    const result = await Subscription.deleteMany({
      status: "pending",
    });

    // Clear the reference cache
    usedReferences.clear();

    console.log(
      `🚨 EMERGENCY: Cleaned up ${result.deletedCount} pending subscription records`
    );
    console.log(
      `🧹 Cleared reference cache (${usedReferences.size} references)`
    );

    res.json({
      success: true,
      message: `EMERGENCY: Cleaned up ${result.deletedCount} pending subscription records and cleared reference cache`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Emergency cleanup error:", error);
    res.status(500).json({
      success: false,
      message: "Error during emergency cleanup",
      error: error.message,
    });
  }
};

// Clear reference cache
const clearReferenceCache = async (req, res) => {
  try {
    const cacheSize = usedReferences.size;
    usedReferences.clear();

    console.log(`🧹 Cleared reference cache (${cacheSize} references)`);

    res.json({
      success: true,
      message: `Cleared reference cache (${cacheSize} references)`,
      clearedCount: cacheSize,
    });
  } catch (error) {
    console.error("Clear cache error:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing reference cache",
      error: error.message,
    });
  }
};

// Upgrade subscription
const upgradeSubscription = async (req, res) => {
  try {
    console.log("=== UPGRADE SUBSCRIPTION START ===");
    console.log("Request body:", req.body);
    console.log("Request user:", req.user);
    console.log("Request headers:", req.headers);

    const { plan, billingCycle } = req.body;
    const userId = req.user._id;

    console.log("Extracted data:", { userId, plan, billingCycle });

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

    // Find the current active subscription
    console.log("Looking for active subscription for user:", userId);
    const currentSubscription = await Subscription.findOne({
      user: userId,
      status: "active",
    });
    console.log("Found current subscription:", currentSubscription);

    if (!currentSubscription) {
      console.log("No active subscription found");
      return res.status(400).json({
        success: false,
        message: "No active subscription found to upgrade.",
      });
    }

    // Check if trying to upgrade to the same plan
    if (
      currentSubscription.plan === plan &&
      currentSubscription.billingCycle === billingCycle
    ) {
      return res.status(400).json({
        success: false,
        message: "You are already on this plan and billing cycle.",
      });
    }

    // Calculate pricing for the new plan
    const pricing = {
      basic: {
        weekly: { price: 15600, originalPrice: 20000 },
        monthly: { price: 45600, originalPrice: 60000 },
        yearly: { price: 119600, originalPrice: 187200 },
      },
      premium: {
        weekly: { price: 25600, originalPrice: 32000 },
        monthly: { price: 65600, originalPrice: 82000 },
        yearly: { price: 319600, originalPrice: 475200 },
      },
      enterprise: {
        weekly: { price: 40600, originalPrice: 50000 },
        monthly: { price: 150600, originalPrice: 190000 },
        yearly: { price: 799600, originalPrice: 1195200 },
      },
    };

    const newPricing = pricing[plan][billingCycle];
    const currentPricing =
      pricing[currentSubscription.plan][currentSubscription.billingCycle];

    // Validate pricing information exists
    if (!newPricing || !currentPricing) {
      console.error("Pricing information not found:", {
        plan,
        billingCycle,
        currentPlan: currentSubscription.plan,
        currentBillingCycle: currentSubscription.billingCycle,
        newPricing,
        currentPricing,
      });
      return res.status(400).json({
        success: false,
        message: "Invalid pricing configuration for the selected plan",
      });
    }

    // Calculate prorated amount
    const now = new Date();
    const timeRemaining = currentSubscription.currentPeriodEnd - now;
    const totalPeriodTime =
      currentSubscription.currentPeriodEnd -
      currentSubscription.currentPeriodStart;

    console.log("Time calculations:", {
      now: now.toISOString(),
      currentPeriodStart: currentSubscription.currentPeriodStart.toISOString(),
      currentPeriodEnd: currentSubscription.currentPeriodEnd.toISOString(),
      timeRemaining: timeRemaining,
      totalPeriodTime: totalPeriodTime,
    });

    // Ensure we don't have negative time values
    const timeUsed = Math.max(0, totalPeriodTime - timeRemaining);
    const timeUsedPercentage =
      totalPeriodTime > 0 ? timeUsed / totalPeriodTime : 0;

    console.log("Proration calculations:", {
      timeUsed,
      timeUsedPercentage,
      currentPricing: currentPricing,
      newPricing: newPricing,
    });

    // Calculate refund for unused time (if downgrading)
    const refundAmount = timeUsedPercentage * currentPricing.price;

    // Calculate amount to charge for new plan
    const newAmount = newPricing.price - refundAmount;
    const amountInKobo = Math.max(0, newAmount) * 100; // Ensure non-negative

    console.log("Amount calculations:", {
      refundAmount,
      newAmount,
      amountInKobo,
    });

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

    // Generate unique reference for upgrade
    let reference;
    let attempts = 0;
    const maxAttempts = 10;

    try {
      while (attempts < maxAttempts) {
        try {
          let uuid;
          try {
            uuid = crypto.randomUUID();
          } catch (e) {
            uuid = uuidv4();
          }
          const timestamp = Date.now();
          const randomSuffix = Math.random().toString(36).substring(2, 12);
          const processId = process.pid || Math.floor(Math.random() * 10000);
          const nanoTime = process.hrtime.bigint().toString();
          const sessionId = Math.random().toString(36).substring(2, 10);
          const attemptId = attempts.toString().padStart(2, "0");
          reference = `upgrade_${timestamp}_${uuid.replace(
            /-/g,
            ""
          )}_${randomSuffix}_${processId}_${nanoTime.substring(
            nanoTime.length - 8
          )}_${sessionId}_${attemptId}`;

          if (!usedReferences.has(reference)) {
            usedReferences.add(reference);
            console.log("Generated unique reference:", reference);
            break;
          }
        } catch (error) {
          console.error("Error generating reference:", error);
        }
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (attempts >= maxAttempts) {
        return res.status(500).json({
          success: false,
          message:
            "Failed to generate unique reference after multiple attempts",
        });
      }
    } catch (refError) {
      console.error("Reference generation error:", refError);
      return res.status(500).json({
        success: false,
        message: "Error generating payment reference",
        error: refError.message,
      });
    }

    // Create upgrade subscription record
    try {
      const currentPeriodEnd = new Date(
        now.getTime() +
          (billingCycle === "weekly"
            ? 7
            : billingCycle === "monthly"
            ? 30
            : 365) *
            24 *
            60 *
            60 *
            1000
      );

      console.log("Creating upgrade subscription with data:", {
        user: userId,
        plan: plan,
        billingCycle: billingCycle,
        amount: newPricing.price,
        currency: "NGN",
        paystackReference: reference,
        status: "pending",
        currentPeriodStart: now,
        currentPeriodEnd: currentPeriodEnd,
        metadata: {
          upgradeFrom: currentSubscription.plan,
          upgradeFromBillingCycle: currentSubscription.billingCycle,
          refundAmount: refundAmount,
          originalSubscriptionId: currentSubscription._id,
        },
      });

      const upgradeSubscription = new Subscription({
        user: userId,
        plan: plan,
        billingCycle: billingCycle,
        amount: newPricing.price,
        currency: "NGN",
        paystackReference: reference,
        status: "pending",
        currentPeriodStart: now,
        currentPeriodEnd: currentPeriodEnd,
        metadata: {
          upgradeFrom: currentSubscription.plan,
          upgradeFromBillingCycle: currentSubscription.billingCycle,
          refundAmount: refundAmount,
          originalSubscriptionId: currentSubscription._id,
        },
      });

      console.log("Saving upgrade subscription:", upgradeSubscription);
      await upgradeSubscription.save();
      console.log("Upgrade subscription saved successfully");
    } catch (dbError) {
      console.error("Database error saving upgrade subscription:", dbError);
      console.error("Validation errors:", dbError.errors);
      console.error("Error name:", dbError.name);
      console.error("Error code:", dbError.code);

      // Handle validation errors specifically
      if (dbError.name === "ValidationError") {
        const validationErrors = Object.values(dbError.errors).map(
          (err) => err.message
        );
        return res.status(400).json({
          success: false,
          message: "Validation error creating upgrade subscription",
          errors: validationErrors,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Database error creating upgrade subscription",
        error: dbError.message,
      });
    }

    // Simulate Paystack response for inline popup
    const paystackResponse = {
      status: true,
      data: {
        reference: reference,
        amount: amountInKobo,
        email: user.email,
      },
    };

    res.status(201).json({
      success: true,
      message: "Upgrade initiated successfully",
      data: {
        subscription: upgradeSubscription,
        reference: paystackResponse.data.reference,
        amount: newPricing.price,
        refundAmount: refundAmount,
        paystackData: {
          key: process.env.PAYSTACK_PUBLIC_KEY,
          email: user.email,
          amount: amountInKobo,
          ref: paystackResponse.data.reference,
          currency: "NGN",
          metadata: {
            userId: userId.toString(),
            plan: plan,
            billingCycle: billingCycle,
            userName: user.name,
            upgradeFrom: currentSubscription.plan,
            originalSubscriptionId: currentSubscription._id.toString(),
          },
        },
      },
    });
  } catch (error) {
    console.error("Upgrade subscription error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error upgrading subscription",
      error: error.message,
    });
  }
};

// Get all subscriptions (admin only)
const getAllSubscriptions = async (req, res) => {
  try {
    console.log("=== GET ALL SUBSCRIPTIONS (ADMIN) ===");
    console.log("Request user:", req.user);
    console.log("Request query:", req.query);

    const {
      userType = "all",
      status = "all",
      plan = "all",
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    let filter = {};

    // Filter by user type
    if (userType !== "all") {
      const users = await User.find({ role: userType }).select("_id");
      const userIds = users.map((user) => user._id);
      filter.user = { $in: userIds };
    }

    // Filter by status
    if (status !== "all") {
      filter.status = status;
    }

    // Filter by plan
    if (plan !== "all") {
      filter.plan = plan;
    }

    console.log("Filter object:", filter);

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get subscriptions with pagination
    const subscriptions = await Subscription.find(filter)
      .populate("user", "name email role phoneNumber")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalSubscriptions = await Subscription.countDocuments(filter);

    // Calculate summary statistics
    const stats = await Subscription.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalCount: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          cancelledCount: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          inactiveCount: {
            $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] },
          },
          avgAmount: { $avg: "$amount" },
        },
      },
    ]);

    const summary = stats[0] || {
      totalAmount: 0,
      totalCount: 0,
      activeCount: 0,
      cancelledCount: 0,
      inactiveCount: 0,
      avgAmount: 0,
    };

    console.log("Found subscriptions:", subscriptions.length);
    console.log("Summary:", summary);

    res.json({
      success: true,
      data: {
        subscriptions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalSubscriptions / parseInt(limit)),
          totalSubscriptions,
          hasNext: skip + subscriptions.length < totalSubscriptions,
          hasPrev: parseInt(page) > 1,
        },
        summary: {
          totalRevenue: summary.totalAmount,
          totalSubscriptions: summary.totalCount,
          activeSubscriptions: summary.activeCount,
          cancelledSubscriptions: summary.cancelledCount,
          inactiveSubscriptions: summary.inactiveCount,
          averageAmount: Math.round(summary.avgAmount),
        },
      },
    });
  } catch (error) {
    console.error("Get all subscriptions error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error fetching subscriptions",
      error: error.message,
    });
  }
};

module.exports = {
  createSubscription,
  confirmSubscription,
  getUserSubscriptions,
  cancelSubscription,
  upgradeSubscription,
  getAllSubscriptions,
  cleanupFailedSubscriptions,
  emergencyCleanup,
  clearReferenceCache,
};
