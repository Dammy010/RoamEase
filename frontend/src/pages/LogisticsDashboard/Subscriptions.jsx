import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const Subscriptions = () => {
  const { user } = useSelector((state) => state.auth);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Fetch user's subscriptions from backend
    setLoading(true);
    // Simulate loading
    setTimeout(() => {
      setSubscriptions([
        {
          id: 1,
          plan: 'Premium',
          status: 'active',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          price: '$99/month'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleUpgrade = (plan) => {
    toast.info(`Upgrading to ${plan} plan...`);
    // TODO: Implement payment integration
  };

  const handleCancel = (subscriptionId) => {
    if (window.confirm('Are you sure you want to cancel this subscription?')) {
      toast.success('Subscription cancelled successfully');
      // TODO: Implement cancellation logic
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">💳 Subscription Management</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading subscriptions...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current Subscription */}
              {subscriptions.length > 0 ? (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">Current Subscription</h3>
                  {subscriptions.map(sub => (
                    <div key={sub.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold text-blue-900">{sub.plan}</p>
                        <p className="text-blue-700">Status: <span className="capitalize">{sub.status}</span></p>
                        <p className="text-blue-600 text-sm">Valid until: {sub.endDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-900">{sub.price}</p>
                        <button
                          onClick={() => handleCancel(sub.id)}
                          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">No active subscriptions</p>
                  <button
                    onClick={() => handleUpgrade('Basic')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Get Started
                  </button>
                </div>
              )}

              {/* Available Plans */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      name: 'Basic',
                      price: '$29',
                      period: '/month',
                      features: ['Up to 10 shipments/month', 'Basic support', 'Standard features'],
                      popular: false
                    },
                    {
                      name: 'Premium',
                      price: '$99',
                      period: '/month',
                      features: ['Unlimited shipments', 'Priority support', 'Advanced analytics', 'API access'],
                      popular: true
                    },
                    {
                      name: 'Enterprise',
                      price: 'Custom',
                      period: '',
                      features: ['Custom solutions', 'Dedicated support', 'White-label options', 'SLA guarantee'],
                      popular: false
                    }
                  ].map((plan, index) => (
                    <div key={index} className={`relative bg-white rounded-lg shadow-lg p-6 border-2 ${
                      plan.popular ? 'border-blue-500' : 'border-gray-200'
                    }`}>
                      {plan.popular && (
                        <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                          Most Popular
                        </span>
                      )}
                      <h4 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h4>
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-gray-600">{plan.period}</span>
                      </div>
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => handleUpgrade(plan.name)}
                        className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
                          plan.popular
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {plan.name === 'Enterprise' ? 'Contact Sales' : 'Choose Plan'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;