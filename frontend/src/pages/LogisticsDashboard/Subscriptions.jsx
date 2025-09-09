import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useTheme } from '../../contexts/ThemeContext';
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
  DollarSign,
  Crown,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  X,
  Check
} from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

const Subscriptions = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const { formatCurrency } = useCurrency();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Perfect for small logistics companies',
      price: 29,
      period: 'month',
      originalPrice: 39,
      discount: 25,
      features: [
        'Up to 50 shipments/month',
        'Basic analytics dashboard',
        'Email support',
        'Standard tracking features',
        'Mobile app access'
      ],
      limitations: [
        'Limited API access',
        'Basic reporting only'
      ],
      popular: false,
      icon: Shield,
      color: 'blue'
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Most popular choice for growing businesses',
      price: 99,
      period: 'month',
      originalPrice: 129,
      discount: 23,
      features: [
        'Unlimited shipments',
        'Advanced analytics & insights',
        'Priority support (24/7)',
        'Full API access',
        'Custom integrations',
        'Advanced reporting',
        'Team collaboration tools',
        'White-label options'
      ],
      limitations: [],
      popular: true,
      icon: Crown,
      color: 'purple'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Custom solutions for large operations',
      price: 299,
      period: 'month',
      originalPrice: 399,
      discount: 25,
      features: [
        'Everything in Premium',
        'Dedicated account manager',
        'Custom development',
        'SLA guarantee (99.9%)',
        'On-premise deployment',
        'Advanced security features',
        'Custom training sessions',
        'Priority feature requests'
      ],
      limitations: [],
      popular: false,
      icon: Sparkles,
      color: 'gold'
    }
  ];

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubscriptions([
        {
          id: 1,
          plan: 'Premium',
          status: 'active',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          price: 99,
          nextBilling: '2025-02-01',
          features: ['Unlimited shipments', 'Priority support', 'Advanced analytics']
        }
      ]);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePayment = async (paymentData) => {
    setPaymentLoading(true);
    try {
      // TODO: Implement actual payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Successfully upgraded to ${selectedPlan.name} plan!`);
      setShowPaymentModal(false);
      setSelectedPlan(null);
      fetchSubscriptions();
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCancel = async (subscriptionId) => {
    if (window.confirm('Are you sure you want to cancel this subscription? You will lose access to premium features at the end of your billing period.')) {
      try {
        // TODO: Implement actual cancellation
        toast.success('Subscription cancelled successfully');
        fetchSubscriptions();
      } catch (error) {
        toast.error('Failed to cancel subscription');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Scale your logistics business with our powerful platform. Start free, upgrade anytime.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading subscription plans...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Current Subscription Status */}
            {subscriptions.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 border border-green-200 dark:border-green-800">
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
                        Next billing: {subscriptions[0].nextBilling} • {formatCurrency(subscriptions[0].price)}/{subscriptions[0].period}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCancel(subscriptions[0].id)}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel Plan</span>
                  </button>
                </div>
              </div>
            )}

            {/* Pricing Plans */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {plans.map((plan) => {
                const IconComponent = plan.icon;
                const isCurrentPlan = subscriptions.length > 0 && subscriptions[0].plan === plan.name;
                
                return (
                  <div
                    key={plan.id}
                    className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl ${
                      plan.popular
                        ? 'border-purple-500 dark:border-purple-400 scale-105'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    } ${isCurrentPlan ? 'ring-2 ring-green-500 dark:ring-green-400' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
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
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                          plan.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                          plan.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                          'bg-yellow-100 dark:bg-yellow-900/30'
                        }`}>
                          <IconComponent className={`w-8 h-8 ${
                            plan.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                            plan.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                            'text-yellow-600 dark:text-yellow-400'
                          }`} />
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
                              {formatCurrency(plan.price)}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">/{plan.period}</span>
                          </div>
                          {plan.originalPrice && (
                            <div className="flex items-center justify-center space-x-2 mt-2">
                              <span className="text-lg text-gray-500 line-through">
                                {formatCurrency(plan.originalPrice)}
                              </span>
                              <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded-full text-sm font-semibold">
                                {plan.discount}% OFF
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-4 mb-8">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">What's included:</h4>
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                          </div>
                        ))}
                        {plan.limitations.map((limitation, idx) => (
                          <div key={idx} className="flex items-start space-x-3">
                            <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-500 dark:text-gray-400">{limitation}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleUpgrade(plan)}
                        disabled={isCurrentPlan || paymentLoading}
                        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                          isCurrentPlan
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-not-allowed'
                            : plan.popular
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
                            : 'bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white'
                        }`}
                      >
                        {isCurrentPlan ? (
                          <>
                            <Check className="w-5 h-5" />
                            <span>Current Plan</span>
                          </>
                        ) : paymentLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <span>{plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}</span>
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Features Comparison */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
                Compare All Features
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Features</th>
                      {plans.map((plan) => (
                        <th key={plan.id} className="text-center py-4 px-6 font-semibold text-gray-900 dark:text-white">
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {[
                      'Shipments per month',
                      'Analytics dashboard',
                      'API access',
                      'Priority support',
                      'Custom integrations',
                      'Team collaboration',
                      'White-label options',
                      'Dedicated manager'
                    ].map((feature, idx) => (
                      <tr key={idx}>
                        <td className="py-4 px-6 text-gray-700 dark:text-gray-300">{feature}</td>
                        {plans.map((plan) => (
                          <td key={plan.id} className="text-center py-4 px-6">
                            {idx === 0 ? (
                              plan.name === 'Basic' ? '50' : plan.name === 'Premium' ? 'Unlimited' : 'Unlimited'
                            ) : idx === 1 ? (
                              <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                            ) : idx === 2 ? (
                              plan.name === 'Basic' ? <X className="w-5 h-5 text-red-500 mx-auto" /> : <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                            ) : idx === 3 ? (
                              plan.name === 'Basic' ? <X className="w-5 h-5 text-red-500 mx-auto" /> : <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                            ) : idx === 4 ? (
                              plan.name === 'Basic' ? <X className="w-5 h-5 text-red-500 mx-auto" /> : <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                            ) : idx === 5 ? (
                              plan.name === 'Basic' ? <X className="w-5 h-5 text-red-500 mx-auto" /> : <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                            ) : idx === 6 ? (
                              plan.name === 'Basic' ? <X className="w-5 h-5 text-red-500 mx-auto" /> : <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              plan.name === 'Enterprise' ? <CheckCircle className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
                Frequently Asked Questions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Can I change plans anytime?</h4>
                  <p className="text-gray-600 dark:text-gray-400">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Is there a free trial?</h4>
                  <p className="text-gray-600 dark:text-gray-400">We offer a 14-day free trial for all plans. No credit card required to start.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">What payment methods do you accept?</h4>
                  <p className="text-gray-600 dark:text-gray-400">We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Can I cancel anytime?</h4>
                  <p className="text-gray-600 dark:text-gray-400">Yes, you can cancel your subscription at any time. No cancellation fees or long-term contracts.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedPlan && (
          <PaymentModal
            plan={selectedPlan}
            onClose={() => setShowPaymentModal(false)}
            onPayment={handlePayment}
            loading={paymentLoading}
          />
        )}
      </div>
    </div>
  );
};

// Payment Modal Component
const PaymentModal = ({ plan, onClose, onPayment, loading }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    cardholderName: '',
    email: ''
  });
  const [errors, setErrors] = useState({});

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({ ...prev, cardNumber: formatted }));
  };

  const handleExpiryDateChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    setFormData(prev => ({ ...prev, expiryDate: formatted }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    
    if (!formData.cardNumber.replace(/\s/g, '')) {
      newErrors.cardNumber = 'Card number is required';
    } else if (formData.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }
    
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Invalid expiry date format';
    }
    
    if (!formData.cvc) {
      newErrors.cvc = 'CVC is required';
    } else if (formData.cvc.length < 3) {
      newErrors.cvc = 'CVC must be at least 3 digits';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onPayment(formData);
    }
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
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">{plan.name} Plan</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">{plan.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  ${plan.price}/{plan.period}
                </div>
                {plan.originalPrice && (
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    Save ${plan.originalPrice - plan.price}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="your@email.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                name="cardholderName"
                value={formData.cardholderName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.cardholderName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="John Doe"
              />
              {errors.cardholderName && <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Card Number
              </label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleCardNumberChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.cardNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
              />
              {errors.cardNumber && <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleExpiryDateChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.expiryDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="MM/YY"
                  maxLength="5"
                />
                {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CVC
                </label>
                <input
                  type="text"
                  name="cvc"
                  value={formData.cvc}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.cvc ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="123"
                  maxLength="4"
                />
                {errors.cvc && <p className="mt-1 text-sm text-red-600">{errors.cvc}</p>}
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Shield className="w-4 h-4" />
                <span className="text-sm">Your payment information is encrypted and secure</span>
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
                type="submit"
                disabled={loading}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay ${plan.price}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;