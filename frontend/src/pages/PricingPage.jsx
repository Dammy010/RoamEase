import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "../contexts/CurrencyContext";
import {
  CheckCircle,
  Star,
  Crown,
  Zap,
  Shield,
  Users,
  BarChart3,
  Headphones,
  Settings,
  Calendar,
  Wallet,
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

const PricingPage = () => {
  const { formatCurrency } = useCurrency();
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState(null);

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
      icon: Users,
      title: "Team Collaboration",
      description:
        "Work together seamlessly with your team and logistics partners.",
    },
    {
      icon: Award,
      title: "Quality Assurance",
      description:
        "Maintain high service standards with built-in quality control features.",
    },
  ];

  const faqs = [
    {
      question: "Can I change my plan anytime?",
      answer:
        "Yes! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately, while downgrades take effect at your next billing cycle.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, MasterCard, American Express), bank transfers, and digital wallets. All payments are processed securely.",
    },
    {
      question: "Is there a free trial?",
      answer:
        "Yes! We offer a 14-day free trial for all plans. No credit card required to start your trial.",
    },
    {
      question: "Do you offer discounts for annual plans?",
      answer:
        "Absolutely! We offer significant discounts when you pay annually: 36% off Basic, 33% off Premium, and 33% off Enterprise plans.",
    },
    {
      question: "What happens if I exceed my plan limits?",
      answer:
        "We'll notify you when you're approaching your limits. You can upgrade your plan or purchase additional shipments as needed.",
    },
    {
      question: "Can I cancel anytime?",
      answer:
        "Yes, you can cancel your subscription at any time. No cancellation fees or long-term contracts. You'll retain access until the end of your billing period.",
    },
  ];

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  return (
    <div className="min-h-screen bg-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-blue-600 text-white py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm"
          >
            <Wallet className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Simple, Transparent Pricing
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl text-blue-100 max-w-3xl mx-auto mb-8"
          >
            Choose the plan that best fits your logistics needs. All plans
            include essential features to streamline your operations.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex items-center justify-center space-x-1 bg-white/20 rounded-lg p-1 max-w-md mx-auto backdrop-blur-sm"
          >
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-blue-100 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === "yearly"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-blue-100 hover:text-white"
              }`}
            >
              Yearly
              <span className="ml-1 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                Save up to 36%
              </span>
            </button>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Pricing Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            const currentPricing = plan.pricing[billingCycle];
            const periodText = billingCycle === "monthly" ? "month" : "year";
            const isPopular = plan.popular;

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
                            currentPricing.originalPrice - currentPricing.price
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
                    onClick={() => handlePlanSelect(plan)}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                      isPopular
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                        : plan.color === "blue"
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                    }`}
                  >
                    <span>Choose {plan.name}</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
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
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Everything you need to know about our pricing plans
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="bg-blue-600 rounded-3xl p-8 md:p-12 text-white text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of companies already using our platform to
              streamline their logistics operations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-colors duration-300 shadow-lg flex items-center justify-center gap-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white hover:text-blue-600 transition-colors duration-300"
              >
                Choose Enterprise
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPage;
