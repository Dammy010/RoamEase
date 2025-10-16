import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useTheme } from "../../contexts/ThemeContext";
import {
  createSubscription,
  confirmSubscription,
  getUserSubscriptions,
  cancelSubscription,
  upgradeSubscription,
  clearError,
} from "../../redux/slices/subscriptionSlice";
import ConfirmationDialog from "../../components/shared/ConfirmationDialog";
import {
  CreditCard,
  CheckCircle,
  Star,
  Zap,
  Shield,
  Users,
  BarChart3,
  Headphones,
  Settings,
  Calendar,
  Wallet,
  Crown,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  X,
  Check,
  Truck,
  Package,
  Globe,
  Lock,
  Clock,
  Mail,
  Phone,
  MapPin,
  Award,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { useCurrency } from "../../contexts/CurrencyContext";

const Subscriptions = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const { formatCurrency } = useCurrency();
  const {
    subscriptions = [],
    currentSubscription,
    loading,
    error,
    paymentLoading,
    paymentError,
  } = useSelector((state) => state.subscription);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  // Confirmation dialog states
  const [showCancelConfirmDialog, setShowCancelConfirmDialog] = useState(false);
  const [pendingCancelId, setPendingCancelId] = useState(null);
  const [loadingPlans, setLoadingPlans] = useState({});
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [forceHideActive, setForceHideActive] = useState(false);

  const [billingCycle, setBillingCycle] = useState("monthly");

  // Define plan hierarchy for upgrade/downgrade logic
  const planHierarchy = {
    basic: 1,
    premium: 2,
    enterprise: 3,
  };

  const getPlanAction = (targetPlan) => {
    if (!currentSubscription) return "upgrade";

    const currentLevel = planHierarchy[currentSubscription.plan] || 0;
    const targetLevel = planHierarchy[targetPlan.id] || 0;

    if (targetLevel > currentLevel) {
      return "upgrade";
    } else if (targetLevel < currentLevel) {
      return "downgrade";
    } else {
      return "change";
    }
  };

  // Error handling
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (paymentError) {
      toast.error(paymentError);
      dispatch(clearError());
    }
  }, [error, paymentError, dispatch]);

  const plans = [
    {
      id: "basic",
      name: "Basic",
      description: "Perfect for small businesses and occasional shippers",
      icon: Shield,
      color: "blue",
      popular: false,
      pricing: {
        monthly: { price: 45600, originalPrice: 60000, discount: 24 },
        yearly: { price: 119600, originalPrice: 187200, discount: 36 },
      },
      features: [
        "Up to 50 shipments per month",
        "Basic analytics dashboard",
        "Email support",
        "Standard tracking features",
        "Mobile app access",
        "Basic reporting",
        "Real-time notifications",
        "API access",
      ],
      limitations: ["No custom integrations", "Basic support only"],
    },
    {
      id: "premium",
      name: "Premium",
      description: "Ideal for growing logistics businesses",
      icon: Crown,
      color: "purple",
      popular: true,
      pricing: {
        monthly: { price: 65600, originalPrice: 82000, discount: 20 },
        yearly: { price: 319600, originalPrice: 475200, discount: 33 },
      },
      features: [
        "Unlimited shipments",
        "Advanced analytics & insights",
        "Priority email & phone support",
        "Advanced tracking features",
        "Mobile app access",
        "Advanced reporting & exports",
        "Real-time notifications",
        "Full API access",
        "Custom integrations",
        "Team collaboration tools",
        "Advanced security features",
        "Priority customer support",
      ],
      limitations: [],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For large-scale logistics operations",
      icon: Sparkles,
      color: "gold",
      popular: false,
      pricing: {
        monthly: { price: 150600, originalPrice: 190000, discount: 21 },
        yearly: { price: 799600, originalPrice: 1195200, discount: 33 },
      },
      features: [
        "Unlimited everything",
        "Custom analytics dashboard",
        "24/7 dedicated support",
        "White-label solutions",
        "Custom mobile apps",
        "Custom reporting & BI",
        "Real-time notifications",
        "Full API access",
        "Custom integrations",
        "Advanced team management",
        "Enterprise security",
        "Dedicated account manager",
        "Custom training & onboarding",
        "SLA guarantees",
        "Custom billing options",
      ],
      limitations: [],
    },
  ];

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      await dispatch(getUserSubscriptions()).unwrap();
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Failed to load subscriptions");
    }
  };

  const handleUpgrade = async (plan) => {
    if (currentSubscription && currentSubscription.status === "active") {
      toast.info("You already have an active subscription");
      return;
    }

    // Set loading state for this specific plan
    setLoadingPlans({ [plan.id]: true });

    try {
      const planWithBilling = {
        ...plan,
        billingCycle,
        price: plan.pricing[billingCycle].price,
        period:
          billingCycle === "weekly"
            ? "week"
            : billingCycle === "monthly"
            ? "month"
            : "year",
      };

      setSelectedPlan(planWithBilling);

      // Create subscription
      const result = await dispatch(
        createSubscription({
          billingCycle,
          plan: plan.id,
        })
      ).unwrap();

      if (result.success) {
        // Store payment data in the plan object
        planWithBilling.paymentData = result.data;
        setSelectedPlan(planWithBilling);
        setShowPaymentModal(true);
        toast.success("Subscription created! Please complete payment.");
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast.error(error || "Failed to create subscription");
    } finally {
      // Clear loading state for this specific plan
      setLoadingPlans({ [plan.id]: false });
    }
  };

  const handleUpgradeSubscription = async (currentSubscription) => {
    setUpgradeLoading(true);
    setShowUpgradeModal(true);
  };

  const handleUpgradePayment = async (plan) => {
    try {
      setUpgradeLoading(true);

      // Create upgrade subscription
      const result = await dispatch(
        upgradeSubscription({
          plan: plan.id,
          billingCycle: billingCycle,
        })
      ).unwrap();

      if (result.success) {
        // Initialize Paystack payment
        const paystackKey =
          result.data.paystackData?.key ||
          import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ||
          "pk_test_56e507241ee90b8b7cb1802d8e27f14035f56e63";
        const userEmail = user?.email || "user@example.com";
        const amount = result.data.amount;
        const reference = result.data.reference;

        // Validate amount and reference
        if (!amount || !reference) {
          throw new Error("Invalid payment data received");
        }

        // Validate Paystack key
        if (!paystackKey || paystackKey === "undefined") {
          throw new Error("Paystack configuration error - missing public key");
        }

        const amountInKobo = Math.round(parseFloat(amount) * 100);

        console.log("Upgrade Payment Data:", {
          paystackKey,
          userEmail,
          amountInKobo,
          reference,
        });

        // Load Paystack script if not already loaded
        if (!window.PaystackPop) {
          const script = document.createElement("script");
          script.src = "https://js.paystack.co/v1/inline.js";
          script.onload = () => {
            console.log("Paystack script loaded successfully");
            initializeUpgradePayment(
              paystackKey,
              userEmail,
              amountInKobo,
              reference
            );
          };
          document.head.appendChild(script);
        } else {
          initializeUpgradePayment(
            paystackKey,
            userEmail,
            amountInKobo,
            reference
          );
        }
      }
    } catch (error) {
      console.error("Upgrade payment error:", error);
      toast.error(error.message || "Failed to initiate upgrade payment");
    } finally {
      setUpgradeLoading(false);
    }
  };

  const initializeUpgradePayment = (
    paystackKey,
    userEmail,
    amountInKobo,
    reference
  ) => {
    try {
      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: userEmail,
        amount: amountInKobo,
        currency: "NGN",
        ref: reference,
        metadata: {
          custom_fields: [
            {
              display_name: "Plan",
              variable_name: "plan",
              value: "upgrade",
            },
            {
              display_name: "Billing Cycle",
              variable_name: "billing_cycle",
              value: billingCycle,
            },
          ],
          referrer: window.location.href,
        },
        callback: function (response) {
          console.log("Upgrade payment successful:", response);
          handleUpgradePaymentSuccess(response.reference);
        },
        onClose: function () {
          console.log("Upgrade payment cancelled");
          toast.info("Upgrade payment cancelled");
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error("Error initializing upgrade payment:", error);
      toast.error("Failed to initialize payment");
    }
  };

  const handleUpgradePaymentSuccess = async (reference) => {
    try {
      // Confirm upgrade payment
      const result = await dispatch(
        confirmSubscription({
          reference: reference,
        })
      ).unwrap();

      if (result.success) {
        toast.success("Subscription upgraded successfully!");
        setShowUpgradeModal(false);
        // Refresh subscriptions
        dispatch(getUserSubscriptions());
      }
    } catch (error) {
      console.error("Upgrade confirmation error:", error);
      toast.error(error.message || "Failed to confirm upgrade");
    }
  };

  const handlePayment = async (reference) => {
    try {
      // Confirm subscription payment
      const result = await dispatch(
        confirmSubscription({
          reference: reference,
        })
      ).unwrap();

      if (result.success) {
        toast.success(`Successfully upgraded to ${selectedPlan.name} plan!`);
        setShowPaymentModal(false);
        setSelectedPlan(null);
        // Clear loading state for all plans
        setLoadingPlans({});
        fetchSubscriptions();
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error || "Payment failed. Please try again.");
    }
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
    // Clear loading state for all plans
    setLoadingPlans({});
  };

  const handleCancel = async (subscriptionId) => {
    setPendingCancelId(subscriptionId);
    setShowCancelConfirmDialog(true);
  };

  const confirmCancel = async () => {
    try {
      await dispatch(cancelSubscription(pendingCancelId)).unwrap();
      toast.success("Subscription cancelled successfully");
      setForceHideActive(true); // Force hide the active section immediately
      fetchSubscriptions();
    } catch (error) {
      console.error("Cancel subscription error:", error);

      // If subscription is already cancelled, just hide the active section
      if (error.includes("already cancelled")) {
        toast.info("Subscription was already cancelled. Refreshing data...");
        setForceHideActive(true);
        fetchSubscriptions();
      } else {
        toast.error(error || "Failed to cancel subscription");
      }
    }
    setShowCancelConfirmDialog(false);
    setPendingCancelId(null);
  };

  return (
    <div className="min-h-screen bg-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-full mb-6 shadow-lg"
          >
            <Wallet className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            {currentSubscription && currentSubscription.status === "active"
              ? currentSubscription.plan === "enterprise"
                ? "Change Your Plan"
                : "Upgrade Your Plan"
              : "Choose Your Perfect Plan"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
          >
            {currentSubscription && currentSubscription.status === "active"
              ? "You're currently on the " +
                currentSubscription.plan.charAt(0).toUpperCase() +
                currentSubscription.plan.slice(1) +
                " plan. Upgrade to unlock more features and capabilities."
              : "Scale your logistics business with our powerful platform. Choose the perfect plan for your needs."}
          </motion.p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Loading subscription plans...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Current Subscription Status - SIMPLIFIED */}
            {forceHideActive ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-8 text-center">
                <X className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Subscription Hidden
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your active subscription is currently hidden. Click the button
                  below to show it again.
                </p>
                <button
                  onClick={() => setForceHideActive(false)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Check className="w-5 h-5" />
                  <span>Show My Subscription</span>
                </button>
              </div>
            ) : (
              (() => {
                // Find the actual active subscription
                const activeSubscription = subscriptions?.find(
                  (sub) =>
                    sub && typeof sub === "object" && sub.status === "active"
                );
                const cancelledSubscription = subscriptions?.find(
                  (sub) =>
                    sub && typeof sub === "object" && sub.status === "cancelled"
                );

                // Don't show if force hidden
                if (forceHideActive) {
                  return null;
                }

                // Don't show if there's no active subscription
                if (!activeSubscription) {
                  return null;
                }

                return (
                  <div className="bg-blue-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-green-900 dark:text-green-100">
                            {activeSubscription.plan.charAt(0).toUpperCase() +
                              activeSubscription.plan.slice(1)}{" "}
                            Plan Active
                          </h3>
                          <p className="text-green-700 dark:text-green-300">
                            Next billing:{" "}
                            {new Date(
                              activeSubscription.currentPeriodEnd
                            ).toLocaleDateString()}{" "}
                            •{" "}
                            {formatCurrency(
                              activeSubscription.amount / 100,
                              "NGN",
                              "NGN"
                            )}
                            /{activeSubscription.billingCycle}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setForceHideActive(true);
                          }}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Hide</span>
                        </button>
                        <button
                          onClick={() => {
                            setForceHideActive(false);
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>Show</span>
                        </button>
                        <button
                          onClick={() => handleCancel(activeSubscription._id)}
                          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel Plan</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}

            {/* Cancelled Subscription Status - Only show if no active subscription */}
            {(() => {
              const hasActiveSubscription = subscriptions.find(
                (sub) =>
                  sub && typeof sub === "object" && sub.status === "active"
              );
              const hasCancelledSubscription = subscriptions.find(
                (sub) =>
                  sub && typeof sub === "object" && sub.status === "cancelled"
              );

              // Don't show cancelled message if there's an active subscription
              if (hasActiveSubscription) {
                return null;
              }

              if (!hasCancelledSubscription) {
                return null;
              }
              return (
                <div className="bg-blue-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl p-8 border border-red-200 dark:border-red-800">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-red-900 dark:text-red-100">
                        Subscription Cancelled
                      </h3>
                      <p className="text-red-700 dark:text-red-300">
                        Your subscription has been cancelled. You will retain
                        access until the end of your billing period.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Billing Cycle Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex items-center justify-center space-x-1 bg-white/20 dark:bg-gray-800/20 rounded-lg p-1 max-w-md mx-auto mb-8 backdrop-blur-sm"
            >
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === "monthly"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === "yearly"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Yearly
                <span className="ml-1 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                  Save up to 36%
                </span>
              </button>
            </motion.div>

            {/* Pricing Plans */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
            >
              {plans.map((plan, index) => {
                const IconComponent = plan.icon;
                const currentPricing = plan.pricing[billingCycle];
                const periodText =
                  billingCycle === "monthly" ? "month" : "year";
                const isPopular = plan.popular;
                const isCurrentPlan =
                  currentSubscription &&
                  currentSubscription.status === "active" &&
                  currentSubscription.plan === plan.id;

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                    className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl ${
                      isPopular
                        ? "border-2 border-purple-500 dark:border-purple-400 scale-105"
                        : "border border-gray-200 dark:border-gray-700"
                    } ${
                      isCurrentPlan
                        ? "ring-2 ring-green-500 dark:ring-green-400"
                        : ""
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                          <Star className="w-4 h-4" />
                          <span>Most Popular</span>
                        </span>
                      </div>
                    )}

                    {isCurrentPlan && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                          <Check className="w-4 h-4" />
                          <span>Current Plan</span>
                        </span>
                      </div>
                    )}

                    <div className="p-8">
                      {/* Plan Header */}
                      <div className="text-center mb-8">
                        <div
                          className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                            plan.color === "blue"
                              ? "bg-blue-100 dark:bg-blue-900/30"
                              : plan.color === "purple"
                              ? "bg-purple-100 dark:bg-purple-900/30"
                              : "bg-yellow-100 dark:bg-yellow-900/30"
                          }`}
                        >
                          <IconComponent
                            className={`w-8 h-8 ${
                              plan.color === "blue"
                                ? "text-blue-600 dark:text-blue-400"
                                : plan.color === "purple"
                                ? "text-purple-600 dark:text-purple-400"
                                : "text-yellow-600 dark:text-yellow-400"
                            }`}
                          />
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {plan.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          {plan.description}
                        </p>

                        {/* Pricing */}
                        <div className="mb-6">
                          <div className="flex items-baseline justify-center space-x-2">
                            <span className="text-5xl font-bold text-gray-900 dark:text-white">
                              {formatCurrency(
                                currentPricing.price,
                                "NGN",
                                "NGN"
                              )}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              /{periodText}
                            </span>
                          </div>
                          <div className="flex items-center justify-center space-x-2 mt-2">
                            <span className="text-lg text-gray-500 line-through">
                              {formatCurrency(
                                currentPricing.originalPrice,
                                "NGN",
                                "NGN"
                              )}
                            </span>
                            <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded-full text-sm font-semibold">
                              {currentPricing.discount}% OFF
                            </span>
                          </div>
                          {billingCycle === "yearly" && (
                            <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">
                              Save ₦
                              {(
                                currentPricing.originalPrice -
                                currentPricing.price
                              ).toLocaleString()}{" "}
                              per year!
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-4 mb-8">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                          What's included:
                        </h4>
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 text-sm">
                              {feature}
                            </span>
                          </div>
                        ))}
                        {plan.limitations.map((limitation, idx) => (
                          <div key={idx} className="flex items-start space-x-3">
                            <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              {limitation}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Action Button */}
                      <motion.button
                        whileHover={isCurrentPlan ? {} : { scale: 1.02 }}
                        whileTap={isCurrentPlan ? {} : { scale: 0.98 }}
                        onClick={() => {
                          if (
                            currentSubscription &&
                            currentSubscription.status === "active"
                          ) {
                            handleUpgradePayment(plan);
                          } else {
                            handleUpgrade(plan);
                          }
                        }}
                        disabled={
                          isCurrentPlan || loadingPlans[plan.id] === true
                        }
                        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                          isCurrentPlan
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-not-allowed"
                            : isPopular
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                            : plan.color === "blue"
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                        }`}
                      >
                        {isCurrentPlan ? (
                          <>
                            <Check className="w-5 h-5" />
                            <span>Active</span>
                          </>
                        ) : loadingPlans[plan.id] === true ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <span>
                              {currentSubscription &&
                              currentSubscription.status === "active"
                                ? getPlanAction(plan) === "upgrade"
                                  ? "Upgrade to"
                                  : getPlanAction(plan) === "downgrade"
                                  ? "Downgrade to"
                                  : "Change to"
                                : "Choose"}{" "}
                              {plan.name}
                            </span>
                            {currentSubscription &&
                            currentSubscription.status === "active" ? (
                              getPlanAction(plan) === "upgrade" ? (
                                <TrendingUp className="w-5 h-5" />
                              ) : getPlanAction(plan) === "downgrade" ? (
                                <TrendingDown className="w-5 h-5" />
                              ) : (
                                <RefreshCw className="w-5 h-5" />
                              )
                            ) : (
                              <ArrowRight className="w-5 h-5" />
                            )}
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Features Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
                Compare All Features
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">
                        Features
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-900 dark:text-white">
                        Basic
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-900 dark:text-white">
                        Premium
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-900 dark:text-white">
                        Enterprise
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {[
                      {
                        name: "Shipments per month",
                        basic: "50",
                        premium: "Unlimited",
                        enterprise: "Unlimited",
                      },
                      {
                        name: "Analytics dashboard",
                        basic: true,
                        premium: true,
                        enterprise: "Custom",
                      },
                      {
                        name: "API access",
                        basic: true,
                        premium: true,
                        enterprise: true,
                      },
                      {
                        name: "Priority support",
                        basic: false,
                        premium: true,
                        enterprise: "24/7 Dedicated",
                      },
                      {
                        name: "Custom integrations",
                        basic: false,
                        premium: true,
                        enterprise: true,
                      },
                      {
                        name: "Team collaboration",
                        basic: false,
                        premium: true,
                        enterprise: true,
                      },
                      {
                        name: "White-label options",
                        basic: false,
                        premium: false,
                        enterprise: true,
                      },
                      {
                        name: "Dedicated manager",
                        basic: false,
                        premium: false,
                        enterprise: true,
                      },
                    ].map((feature, idx) => (
                      <tr key={idx}>
                        <td className="py-4 px-6 text-gray-700 dark:text-gray-300 font-medium">
                          {feature.name}
                        </td>
                        <td className="text-center py-4 px-6">
                          {typeof feature.basic === "boolean" ? (
                            feature.basic ? (
                              <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-red-500 mx-auto" />
                            )
                          ) : (
                            <span className="text-gray-700 dark:text-gray-300">
                              {feature.basic}
                            </span>
                          )}
                        </td>
                        <td className="text-center py-4 px-6">
                          {typeof feature.premium === "boolean" ? (
                            feature.premium ? (
                              <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-red-500 mx-auto" />
                            )
                          ) : (
                            <span className="text-gray-700 dark:text-gray-300">
                              {feature.premium}
                            </span>
                          )}
                        </td>
                        <td className="text-center py-4 px-6">
                          {typeof feature.enterprise === "boolean" ? (
                            feature.enterprise ? (
                              <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-red-500 mx-auto" />
                            )
                          ) : (
                            <span className="text-gray-700 dark:text-gray-300">
                              {feature.enterprise}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="bg-blue-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
                Frequently Asked Questions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0, duration: 0.5 }}
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                    Can I change billing cycles anytime?
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Yes, you can switch between monthly and yearly billing
                    cycles at any time. Changes take effect on your next billing
                    date.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1, duration: 0.5 }}
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                    What payment methods do you accept?
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    We accept all major credit cards (Visa, MasterCard, American
                    Express) and PayPal.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <X className="w-5 h-5 mr-2 text-blue-600" />
                    Can I cancel anytime?
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Yes, you can cancel your subscription at any time. No
                    cancellation fees or long-term contracts.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3, duration: 0.5 }}
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    Can I upgrade or downgrade my plan?
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Yes, you can upgrade or downgrade your plan at any time.
                    Changes will be prorated based on your billing cycle.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4, duration: 0.5 }}
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-blue-600" />
                    Is my data secure?
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Yes, we use enterprise-grade security with 256-bit SSL
                    encryption and comply with industry standards.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <Headphones className="w-5 h-5 mr-2 text-blue-600" />
                    What support do you offer?
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Basic plan includes email support, Premium includes priority
                    support, and Enterprise includes 24/7 dedicated support.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedPlan && (
          <PaymentModal
            plan={selectedPlan}
            paymentData={selectedPlan.paymentData}
            onClose={handleCloseModal}
            onPayment={handlePayment}
            loading={paymentLoading}
          />
        )}

        {showUpgradeModal && (
          <UpgradeModal
            currentSubscription={subscriptions?.find(
              (sub) => sub && typeof sub === "object" && sub.status === "active"
            )}
            onClose={() => setShowUpgradeModal(false)}
            onUpgrade={handleUpgradePayment}
            loading={upgradeLoading}
            billingCycle={billingCycle}
            setBillingCycle={setBillingCycle}
          />
        )}
      </div>
    </div>
  );
};

// Payment Modal Component
const PaymentModal = ({ plan, paymentData, onClose, onPayment, loading }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // Get user email from localStorage or user context
    const email = localStorage.getItem("userEmail") || "user@example.com";
    setUserEmail(email);
  }, []);

  const initializePaystackPayment = async () => {
    try {
      setIsProcessing(true);

      // Get Paystack public key from environment or use fallback
      const paystackKey =
        import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ||
        "pk_test_56e507241ee90b8b7cb1802d8e27f14035f56e63";

      // Check if Paystack is available
      if (typeof window.PaystackPop === "undefined") {
        throw new Error("Paystack script not loaded. Please refresh the page.");
      }

      // Use the payment data that was already created in handleUpgrade
      // The subscription was already created, so we just need to use the reference
      if (!paymentData) {
        console.error("❌ Payment data not available:", paymentData);
        throw new Error("Payment data not available. Please try again.");
      }

      console.log("Using payment data:", paymentData);
      console.log("Plan price:", plan.price);
      console.log("User email:", userEmail);

      // Extract amount from payment data with fallback to plan price
      const rawAmount =
        paymentData.subscription?.amount || paymentData.amount || plan.price;
      const amount = parseFloat(rawAmount);
      const reference = paymentData.reference;

      console.log("Raw amount:", rawAmount);
      console.log("Parsed amount:", amount);
      console.log("Extracted reference:", reference);
      console.log("Plan price fallback:", plan.price);
      console.log("Amount type:", typeof amount);

      if (!amount || isNaN(amount) || amount <= 0) {
        throw new Error(`Invalid amount in payment data: ${rawAmount}`);
      }

      if (!reference) {
        throw new Error("Invalid reference in payment data");
      }

      // Convert amount to kobo (multiply by 100)
      const amountInKobo = Math.round(amount * 100);

      console.log("Final amount in kobo:", amountInKobo);
      console.log("Final reference:", reference);
      console.log("User email:", userEmail);
      console.log("Paystack key:", paystackKey);

      // Validate all required parameters
      if (!userEmail || !paystackKey || !amountInKobo || !reference) {
        throw new Error(
          `Missing required parameters: email=${userEmail}, key=${!!paystackKey}, amount=${amountInKobo}, ref=${reference}`
        );
      }

      // Use Paystack inline popup with the existing reference
      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: userEmail,
        amount: amountInKobo, // Amount in kobo
        currency: "NGN",
        ref: reference, // Use reference from payment data
        metadata: {
          custom_fields: [
            {
              display_name: "Plan",
              variable_name: "plan",
              value: plan.name,
            },
            {
              display_name: "Billing Cycle",
              variable_name: "billing_cycle",
              value: plan.billingCycle,
            },
          ],
        },
        callback: function (response) {
          console.log("Payment successful:", response);
          handlePaymentSuccess(response.reference);
        },
        onClose: function () {
          console.log("Payment cancelled by user");
          toast.info("Payment cancelled");
        },
      });

      console.log("Opening Paystack payment modal...");
      handler.openIframe();
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error(`Failed to initialize payment: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = (reference) => {
    onPayment(reference);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Complete Payment
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Plan Summary */}
          <div className="bg-blue-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  {plan.name} Plan
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {plan.description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  ₦{plan.price.toLocaleString()}/{plan.period}
                </div>
                {plan.originalPrice && (
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    Save ₦{(plan.originalPrice - plan.price).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Payment Details
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                You will be redirected to Paystack's secure payment page to
                complete your subscription.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Shield className="w-4 h-4" />
              <span className="text-sm">
                Your payment information is encrypted and secure
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={initializePaystackPayment}
              disabled={isProcessing}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                isProcessing
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay with Paystack</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Upgrade Modal Component
const UpgradeModal = ({
  currentSubscription,
  onClose,
  onUpgrade,
  loading,
  billingCycle,
  setBillingCycle,
}) => {
  const { formatCurrency } = useCurrency();
  const { isDark } = useTheme();

  const plans = [
    {
      id: "basic",
      name: "Basic",
      description: "Perfect for small businesses and occasional shippers",
      icon: Shield,
      color: "blue",
      popular: false,
      pricing: {
        monthly: { price: 45600, originalPrice: 60000, discount: 24 },
        yearly: { price: 119600, originalPrice: 187200, discount: 36 },
      },
      features: [
        "Up to 50 shipments per month",
        "Basic analytics dashboard",
        "Email support",
        "Standard tracking features",
        "Mobile app access",
        "Basic reporting",
        "Real-time notifications",
        "API access",
      ],
      limitations: ["No custom integrations", "Basic support only"],
    },
    {
      id: "premium",
      name: "Premium",
      description: "Ideal for growing logistics businesses",
      icon: Crown,
      color: "purple",
      popular: true,
      pricing: {
        monthly: { price: 65600, originalPrice: 82000, discount: 20 },
        yearly: { price: 319600, originalPrice: 475200, discount: 33 },
      },
      features: [
        "Unlimited shipments",
        "Advanced analytics & insights",
        "Priority email & phone support",
        "Advanced tracking features",
        "Mobile app access",
        "Advanced reporting & exports",
        "Real-time notifications",
        "Full API access",
        "Custom integrations",
        "Team collaboration tools",
        "Advanced security features",
        "Priority customer support",
      ],
      limitations: [],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For large-scale logistics operations",
      icon: Sparkles,
      color: "gold",
      popular: false,
      pricing: {
        monthly: { price: 150600, originalPrice: 190000, discount: 21 },
        yearly: { price: 799600, originalPrice: 1195200, discount: 33 },
      },
      features: [
        "Unlimited everything",
        "Custom analytics dashboard",
        "24/7 dedicated support",
        "White-label solutions",
        "Custom mobile apps",
        "Custom reporting & BI",
        "Real-time notifications",
        "Full API access",
        "Custom integrations",
        "Advanced team management",
        "Enterprise security",
        "Dedicated account manager",
        "Custom training & onboarding",
        "SLA guarantees",
        "Custom billing options",
      ],
      limitations: [],
    },
  ];

  // Filter out the current plan
  const availablePlans = plans.filter(
    (plan) => plan.id !== currentSubscription?.plan
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentSubscription?.plan === "enterprise"
              ? "Change Your Plan"
              : "Upgrade Your Plan"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You are currently on the{" "}
            <strong>
              {currentSubscription?.plan?.charAt(0).toUpperCase() +
                currentSubscription?.plan?.slice(1)}
            </strong>{" "}
            plan. Choose a higher plan to unlock more features and capabilities.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Billing Cycle:
            </span>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {["monthly", "yearly"].map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => setBillingCycle(cycle)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    billingCycle === cycle
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availablePlans.map((plan) => {
            const Icon = plan.icon;
            const pricing = plan.pricing[billingCycle];

            return (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-gray-800 border-2 rounded-2xl p-6 transition-all duration-200 hover:shadow-lg ${
                  plan.popular
                    ? "border-purple-500 dark:border-purple-400"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                      plan.color === "blue"
                        ? "bg-blue-100 dark:bg-blue-900/30"
                        : plan.color === "purple"
                        ? "bg-purple-100 dark:bg-purple-900/30"
                        : "bg-yellow-100 dark:bg-yellow-900/30"
                    }`}
                  >
                    <Icon
                      className={`w-8 h-8 ${
                        plan.color === "blue"
                          ? "text-blue-600 dark:text-blue-400"
                          : plan.color === "purple"
                          ? "text-purple-600 dark:text-purple-400"
                          : "text-yellow-600 dark:text-yellow-400"
                      }`}
                    />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {plan.description}
                  </p>

                  <div className="mb-4">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(pricing.price / 100, "NGN", "NGN")}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        /{billingCycle === "monthly" ? "month" : "year"}
                      </span>
                    </div>
                    {pricing.originalPrice && (
                      <div className="flex items-center justify-center space-x-2 mt-1">
                        <span className="text-sm text-gray-500 line-through">
                          {formatCurrency(
                            pricing.originalPrice / 100,
                            "NGN",
                            "NGN"
                          )}
                        </span>
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                          {pricing.discount}% off
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onUpgrade(plan)}
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                    plan.color === "blue"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : plan.color === "purple"
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-yellow-600 hover:bg-yellow-700 text-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {getPlanAction(plan) === "upgrade" ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : getPlanAction(plan) === "downgrade" ? (
                        <TrendingDown className="w-4 h-4" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      <span>
                        {getPlanAction(plan) === "upgrade"
                          ? "Upgrade to"
                          : getPlanAction(plan) === "downgrade"
                          ? "Downgrade to"
                          : "Change to"}{" "}
                        {plan.name}
                      </span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modern Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showCancelConfirmDialog}
        onClose={() => {
          setShowCancelConfirmDialog(false);
          setPendingCancelId(null);
        }}
        onConfirm={confirmCancel}
        title="Cancel Subscription"
        message="Are you sure you want to cancel this subscription? You will lose access to premium features at the end of your billing period."
        confirmText="Cancel Subscription"
        cancelText="Keep Subscription"
        type="warning"
      />
    </div>
  );
};

export default Subscriptions;
