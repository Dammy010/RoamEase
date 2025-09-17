import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  createSubscription,
  confirmSubscription,
  getUserSubscriptions,
  cancelSubscription,
  clearError,
} from "../redux/slices/subscriptionSlice";
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
  Clock,
  Globe,
  Lock,
  TrendingUp,
  MessageSquare,
  Award,
  RefreshCw,
} from "lucide-react";
import { useCurrency } from "../contexts/CurrencyContext";

const SubscriptionPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { subscriptions, currentSubscription, error } = useSelector(
    (state) => state.subscription
  );
  const { formatCurrency } = useCurrency();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState({});
  const [isAnyPlanLoading, setIsAnyPlanLoading] = useState(false);
  const [forceHideActive, setForceHideActive] = useState(false);

  const [billingCycle, setBillingCycle] = useState("monthly");

  // Error handling
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    const hasLoadingPlan = Object.values(loadingPlans).some(
      (loading) => loading === true
    );
    setIsAnyPlanLoading(hasLoadingPlan);
  }, [loadingPlans]);

  useEffect(() => {
    // Additional debugging
    if (subscriptions && subscriptions.length > 0) {
      subscriptions.forEach((sub, index) => {});
    }
  }, [currentSubscription, subscriptions]);

  // Fetch subscriptions on component mount and force refresh
  useEffect(() => {
    if (user) {
      dispatch(getUserSubscriptions());
      // Force refresh multiple times to ensure we get the latest data
      setTimeout(() => dispatch(getUserSubscriptions()), 100);
      setTimeout(() => dispatch(getUserSubscriptions()), 500);
    }
  }, [user, dispatch]);

  // Function to refresh subscription data with direct API call
  const refreshSubscriptions = useCallback(async () => {
    if (user) {
      try {
        const response = await fetch(
          "http://localhost:5000/api/subscriptions/my-subscriptions",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          // Update Redux state directly
          dispatch({
            type: "subscription/getUserSubscriptions/fulfilled",
            payload: data,
          });
        } else {
          console.error("Failed to fetch subscriptions:", response.status);
        }
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
        // Fallback to Redux action
        dispatch(getUserSubscriptions());
      }
    }
  }, [user, dispatch]);

  // Function to check subscription status directly from API
  const checkSubscriptionStatus = useCallback(async () => {
    if (user) {
      try {
        const response = await fetch(
          "http://localhost:5000/api/subscriptions/my-subscriptions",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          if (data.subscriptions && data.subscriptions.length > 0) {
            data.subscriptions.forEach((sub, index) => {});
          }
        } else {
          console.error(
            "Failed to check subscription status:",
            response.status
          );
        }
      } catch (error) {
        console.error("Error checking subscription status:", error);
      }
    }
  }, [user]);

  // Function to handle subscription cancellation
  const handleCancelSubscription = async (subscriptionId) => {
    if (
      window.confirm(
        "Are you sure you want to cancel this subscription? You will lose access to premium features at the end of your billing period."
      )
    ) {
      try {
        const result = await dispatch(
          cancelSubscription(subscriptionId)
        ).unwrap();
        toast.success("Subscription cancelled successfully");

        // Clear Redux state completely
        dispatch({
          type: "subscription/clearState",
        });

        // Force refresh subscription data multiple times
        await refreshSubscriptions();
        setTimeout(() => refreshSubscriptions(), 500);
        setTimeout(() => refreshSubscriptions(), 1000);

        // Also check API status directly
        setTimeout(() => checkSubscriptionStatus(), 1500);
      } catch (error) {
        console.error("Cancel subscription error:", error);

        // If subscription is already cancelled, just refresh the data
        if (error.includes("already cancelled")) {
          toast.info("Subscription was already cancelled. Refreshing data...");
          setForceHideActive(true); // Force hide the active section immediately
          dispatch({
            type: "subscription/clearState",
          });
          await refreshSubscriptions();
          setTimeout(() => checkSubscriptionStatus(), 500);
        } else {
          toast.error(error || "Failed to cancel subscription");
        }
      }
    }
  };

  const plans = [
    {
      id: "basic",
      name: "Basic",
      description: "Perfect for small logistics companies",
      features: [
        "Up to 50 shipments/month",
        "Basic analytics dashboard",
        "Email support",
        "Standard tracking features",
        "Mobile app access",
        "Basic reporting",
        "Real-time notifications",
        "API access",
      ],
      limitations: ["No custom integrations", "Basic support only"],
      popular: false,
      icon: Shield,
      color: "blue",
      pricing: {
        weekly: { price: 15600, originalPrice: 20000, discount: 22 },
        monthly: { price: 45600, originalPrice: 60000, discount: 24 },
        yearly: { price: 119600, originalPrice: 187200, discount: 36 },
      },
    },
    {
      id: "premium",
      name: "Premium",
      description: "Ideal for growing logistics businesses",
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
      popular: true,
      icon: Crown,
      color: "purple",
      pricing: {
        weekly: { price: 25600, originalPrice: 32000, discount: 20 },
        monthly: { price: 65600, originalPrice: 82000, discount: 20 },
        yearly: { price: 319600, originalPrice: 475200, discount: 33 },
      },
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For large-scale logistics operations",
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
      popular: false,
      icon: Sparkles,
      color: "gold",
      pricing: {
        weekly: { price: 40600, originalPrice: 50000, discount: 19 },
        monthly: { price: 150600, originalPrice: 190000, discount: 21 },
        yearly: { price: 799600, originalPrice: 1195200, discount: 33 },
      },
    },
  ];

  const features = [
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Get insights into your logistics performance with detailed analytics and reporting.",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description:
        "Connect with logistics partners worldwide and expand your business reach.",
    },
    {
      icon: Lock,
      title: "Secure Platform",
      description:
        "Enterprise-grade security to protect your data and ensure compliance.",
    },
    {
      icon: TrendingUp,
      title: "Growth Tools",
      description:
        "Scale your business with tools designed for logistics growth and efficiency.",
    },
    {
      icon: MessageSquare,
      title: "Real-time Communication",
      description:
        "Stay connected with instant messaging and notification systems.",
    },
    {
      icon: Award,
      title: "Quality Assurance",
      description:
        "Maintain high service standards with built-in quality control features.",
    },
  ];

  const handleUpgrade = async (plan) => {
    if (!user) {
      toast.info("Please sign up or log in to subscribe to a plan");
      return;
    }

    if (currentSubscription && currentSubscription.status === "active") {
      toast.info("You already have an active subscription");
      return;
    }

    // Set loading state for this specific plan only

    setLoadingPlans((prev) => {
      const newState = { [plan.id]: true };

      return newState;
    });

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
      setShowPaymentModal(true);
    } catch (error) {
      console.error("Error selecting plan:", error);
      toast.error("Failed to select plan. Please try again.");
      // Clear loading state only on error
      setLoadingPlans({});
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
        toast.success(`Successfully subscribed to ${selectedPlan.name} plan!`);
        setShowPaymentModal(false);
        setSelectedPlan(null);
        // Clear loading state when payment is successful
        setLoadingPlans({});
        // Refresh subscription data to update UI
        refreshSubscriptions();
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error || "Payment failed. Please try again.");
    }
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
    // Clear loading state when modal is closed
    setLoadingPlans({});
  };

  return (
    <div className="min-h-screen py-6 bg-gray-50 dark:bg-gray-900">
      {/* VERY OBVIOUS TEST BANNER - REMOVE AFTER TESTING */}
      <div className="bg-red-600 text-white p-4 text-center font-bold text-xl">
        🚨 TEST BANNER - IF YOU SEE THIS, THE CHANGES ARE WORKING! 🚨
      </div>
      {/* Hero Section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-6">
              Scale Your Logistics Business
            </h1>
            <p className="text-base mb-8 max-w-3xl mx-auto opacity-90">
              Join thousands of logistics companies using our platform to
              streamline operations, increase efficiency, and grow their
              business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() =>
                  document
                    .getElementById("pricing")
                    .scrollIntoView({ behavior: "smooth" })
                }
                className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2 text-sm"
              >
                <span>View Plans</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("features")
                    .scrollIntoView({ behavior: "smooth" })
                }
                className="px-6 py-3 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors text-sm"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Section - Temporary */}
      <div className="py-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mx-4 mb-4">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-4">
            Debug Info:
          </h3>
          <div className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
            <p>
              <strong>All Subscriptions:</strong>{" "}
              {JSON.stringify(subscriptions, null, 2)}
            </p>
            <p>
              <strong>Current Subscription (Redux):</strong>{" "}
              {JSON.stringify(currentSubscription, null, 2)}
            </p>
            <p>
              <strong>Active Found:</strong>{" "}
              {subscriptions?.find((sub) => sub.status === "active")
                ? "Yes"
                : "No"}
            </p>
            <p>
              <strong>Cancelled Found:</strong>{" "}
              {subscriptions?.find((sub) => sub.status === "cancelled")
                ? "Yes"
                : "No"}
            </p>
          </div>

          {/* Debug Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                refreshSubscriptions();
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center space-x-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Data</span>
            </button>
            <button
              onClick={() => {
                checkSubscriptionStatus();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center space-x-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Check API Status</span>
            </button>
            <button
              onClick={() => {
                setForceHideActive(true);
              }}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors flex items-center space-x-2 text-sm"
            >
              <X className="w-4 h-4" />
              <span>Force Hide Active</span>
            </button>
            <button
              onClick={() => {
                dispatch({
                  type: "subscription/clearState",
                });
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center space-x-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Force Clear & Reload</span>
            </button>
          </div>
        </div>
      </div>

      {/* Current Subscription Section */}
      {!forceHideActive &&
        (() => {
          const allSubscriptions = subscriptions || [];
          const activeSubscription = allSubscriptions.find(
            (sub) => sub.status === "active"
          );
          const cancelledSubscription = allSubscriptions.find(
            (sub) => sub.status === "cancelled"
          );

          // Don't show active section if force hide is true
          if (forceHideActive) {
            return null;
          }

          // Don't show active section if there's a cancelled subscription or no active subscription
          if (cancelledSubscription) {
            return null;
          }

          if (!activeSubscription) {
            return null;
          }

          return (
            <div className="py-12 bg-blue-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="max-w-7xl mx-auto px-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-green-200 dark:border-green-800 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
                          {activeSubscription.plan.charAt(0).toUpperCase() +
                            activeSubscription.plan.slice(1)}{" "}
                          Plan Active
                        </h3>
                        <p className="text-green-700 dark:text-green-300 mb-1">
                          Next billing:{" "}
                          {new Date(
                            activeSubscription.currentPeriodEnd
                          ).toLocaleDateString()}
                        </p>
                        <p className="text-green-600 dark:text-green-400 text-sm">
                          {formatCurrency(
                            activeSubscription.amount,
                            "NGN",
                            "NGN"
                          )}
                          /{activeSubscription.billingCycle}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => refreshSubscriptions()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Refresh</span>
                        </button>
                        <button
                          onClick={() =>
                            handleCancelSubscription(activeSubscription._id)
                          }
                          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel Subscription</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Cancelled Subscription Section */}
      {(() => {
        const allSubscriptions = subscriptions || [];
        const cancelledSubscription = allSubscriptions.find(
          (sub) => sub.status === "cancelled"
        );

        if (!cancelledSubscription) {
          return null;
        }

        return (
          <div className="py-12 bg-blue-50 dark:from-red-900/20 dark:to-orange-900/20">
            <div className="max-w-7xl mx-auto px-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-red-200 dark:border-red-800 shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <X className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">
                      Subscription Cancelled
                    </h3>
                    <p className="text-red-700 dark:text-red-300">
                      Your subscription has been cancelled. You will retain
                      access until the end of your billing period.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Features Section */}
      <div id="features" className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools and features you
              need to manage and grow your logistics business effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
                    <IconComponent className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Billing Cycle
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
              Choose the billing cycle that works best for you. Cancel or change
              anytime.
            </p>

            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 max-w-md mx-auto">
              <button
                onClick={() => setBillingCycle("weekly")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === "weekly"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Weekly
              </button>
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
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan) => {
              const IconComponent = plan.icon;
              const currentPricing = plan.pricing[billingCycle];
              const periodText =
                billingCycle === "weekly"
                  ? "week"
                  : billingCycle === "monthly"
                  ? "month"
                  : "year";
              const isPopular = plan.popular;

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl ${
                    isPopular
                      ? "border-2 border-purple-500 dark:border-purple-400 scale-105"
                      : "border border-gray-200 dark:border-gray-700"
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
                            {formatCurrency(currentPricing.price, "NGN", "NGN")}
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
                    <button
                      onClick={() => {
                        handleUpgrade(plan);
                      }}
                      disabled={
                        loadingPlans[plan.id] === true ||
                        (currentSubscription &&
                          currentSubscription.status === "active")
                      }
                      className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                        currentSubscription &&
                        currentSubscription.status === "active"
                          ? "bg-green-600 text-white cursor-not-allowed"
                          : isPopular
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                          : plan.color === "blue"
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                      }`}
                    >
                      {loadingPlans[plan.id] === true ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : currentSubscription &&
                        currentSubscription.status === "active" ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>Subscribed</span>
                        </>
                      ) : (
                        <>
                          <span>Subscribe Now</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Plan Comparison Table */}
      <div className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Compare Plans
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              See how our plans stack up against each other
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Features
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan.id}
                      className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold">{plan.name}</span>
                        <span className="text-xs text-gray-500">
                          {plan.description}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {[
                  {
                    feature: "Monthly Shipments",
                    basic: "Up to 50",
                    premium: "Unlimited",
                    enterprise: "Unlimited",
                  },
                  {
                    feature: "Analytics Dashboard",
                    basic: "Basic",
                    premium: "Advanced",
                    enterprise: "Custom",
                  },
                  {
                    feature: "Support",
                    basic: "Email",
                    premium: "Priority Email & Phone",
                    enterprise: "24/7 Dedicated",
                  },
                  {
                    feature: "API Access",
                    basic: "Basic",
                    premium: "Full",
                    enterprise: "Full + Custom",
                  },
                  {
                    feature: "Custom Integrations",
                    basic: "No",
                    premium: "Yes",
                    enterprise: "Yes + White-label",
                  },
                  {
                    feature: "Team Collaboration",
                    basic: "No",
                    premium: "Yes",
                    enterprise: "Advanced",
                  },
                  {
                    feature: "Account Manager",
                    basic: "No",
                    premium: "No",
                    enterprise: "Yes",
                  },
                  {
                    feature: "SLA Guarantees",
                    basic: "No",
                    premium: "No",
                    enterprise: "Yes",
                  },
                ].map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {row.feature}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                      {row.basic}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                      {row.premium}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                      {row.enterprise}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Everything you need to know about our subscription plans
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                question: "Can I change billing cycles anytime?",
                answer:
                  "Yes, you can switch between weekly, monthly, and yearly billing cycles at any time. Changes take effect on your next billing date and we'll prorate any billing differences.",
              },
              {
                question: "What payment methods do you accept?",
                answer:
                  "We accept all major credit cards (Visa, MasterCard, American Express), bank transfers, and digital wallets. All payments are processed securely through our encrypted payment system.",
              },
              {
                question: "Can I cancel anytime?",
                answer:
                  "Absolutely! You can cancel your subscription at any time. No cancellation fees or long-term contracts. You'll retain access until the end of your billing period.",
              },
              {
                question: "Do you offer discounts for annual plans?",
                answer:
                  "Yes! We offer significant discounts when you pay annually: 36% off Basic, 33% off Premium, and 33% off Enterprise plans. This can save you hundreds of dollars per year.",
              },
              {
                question:
                  "What's the difference between Premium and Enterprise?",
                answer:
                  "Premium is perfect for growing businesses with unlimited shipments and advanced features. Enterprise includes white-label solutions, custom development, dedicated support, and SLA guarantees for large-scale operations.",
              },
              {
                question: "Can I upgrade or downgrade my plan?",
                answer:
                  "Yes! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately, while downgrades take effect at your next billing cycle. We'll prorate any billing differences.",
              },
              {
                question: "What happens to my data if I cancel?",
                answer:
                  "Your data is safely stored for 30 days after cancellation. You can export all your data during this period or reactivate your account anytime.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Logistics Business?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of companies already using our platform to streamline
            their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() =>
                document
                  .getElementById("pricing")
                  .scrollIntoView({ behavior: "smooth" })
              }
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => window.open("mailto:sales@roamease.com", "_blank")}
              className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          onClose={handleCloseModal}
          onPayment={handlePayment}
        />
      )}
    </div>
  );
};

// Payment Modal Component
const PaymentModal = ({ plan, onClose, onPayment, loading }) => {
  const [paymentData, setPaymentData] = useState(null);
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

      // Create subscription to get payment data
      const response = await fetch(
        "http://localhost:5000/api/subscriptions/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            billingCycle: plan.billingCycle,
            plan: plan.id,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        setPaymentData(result.data);

        // Check if Paystack is available
        if (typeof window.PaystackPop === "undefined") {
          throw new Error(
            "Paystack script not loaded. Please refresh the page."
          );
        }

        // Use Paystack inline popup instead of redirect
        const handler = window.PaystackPop.setup({
          key: paystackKey,
          email: userEmail,
          amount: plan.price * 100, // Convert to kobo using plan price
          currency: "NGN",
          ref: result.data.reference,
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
      } else {
        console.error("API returned error:", result);

        // Handle duplicate reference error specifically
        if (result.error === "DUPLICATE_REFERENCE") {
          toast.error(
            "Please wait a moment and try again. Transaction reference conflict detected."
          );
        } else {
          toast.error(result.message || "Failed to initialize payment");
        }
      }
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

export default SubscriptionPage;
