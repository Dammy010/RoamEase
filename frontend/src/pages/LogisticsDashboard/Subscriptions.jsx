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
  clearError,
} from "../../redux/slices/subscriptionSlice";
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
    subscriptions,
    currentSubscription,
    loading,
    error,
    paymentLoading,
    paymentError,
  } = useSelector((state) => state.subscription);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [forceHideActive, setForceHideActive] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState({});

  const [billingCycle, setBillingCycle] = useState("monthly");

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
    if (
      window.confirm(
        "Are you sure you want to cancel this subscription? You will lose access to premium features at the end of your billing period."
      )
    ) {
      try {
        await dispatch(cancelSubscription(subscriptionId)).unwrap();
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
    }
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
            Choose Your Perfect Plan
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
          >
            Scale your logistics business with our powerful platform. Upgrade
            anytime.
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
            {!forceHideActive &&
              subscriptions &&
              subscriptions.length > 0 &&
              !subscriptions.find((sub) => sub.status === "cancelled") && (
                <div className="bg-blue-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-green-900 dark:text-green-100">
                          {subscriptions[0].plan} Plan Active
                        </h3>
                        <p className="text-green-700 dark:text-green-300">
                          Next billing:{" "}
                          {new Date(
                            subscriptions[0].currentPeriodEnd
                          ).toLocaleDateString()}{" "}
                          •{" "}
                          {formatCurrency(
                            subscriptions[0].amount / 100,
                            "NGN",
                            "NGN"
                          )}
                          /{subscriptions[0].billingCycle}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setForceHideActive(true);
                          alert("Force Hide activated!");
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Force Hide</span>
                      </button>
                      <button
                        onClick={() => handleCancel(subscriptions[0]._id)}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel Plan</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            {/* Cancelled Subscription Status */}
            {subscriptions.find((sub) => sub.status === "cancelled") && (
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
            )}

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
                  subscriptions.length > 0 &&
                  subscriptions[0].plan === plan.name;

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
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleUpgrade(plan)}
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
                            <span>Current Plan</span>
                          </>
                        ) : loadingPlans[plan.id] === true ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <span>Choose {plan.name}</span>
                            <ArrowRight className="w-5 h-5" />
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
      // Use Paystack inline popup with the existing reference
      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: userEmail,
        amount: plan.price * 100, // Convert to kobo using plan price
        currency: "NGN",
        ref: paymentData.reference,
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
          handlePaymentSuccess(response.reference);
        },
        onClose: function () {
          toast.info("Payment cancelled");
        },
      });

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

export default Subscriptions;
