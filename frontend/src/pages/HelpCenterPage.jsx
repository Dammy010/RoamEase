import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, Search, BookOpen, MessageSquare, 
  Phone, Mail, Clock, CheckCircle, ArrowRight,
  Users, Settings, Shield, Globe, FileText, ChevronDown,
  ChevronUp, ExternalLink, Star, Zap, Truck, Package,
  CreditCard, User, Lock, Bell, Smartphone, Monitor
} from 'lucide-react';
import { Link } from 'react-router-dom';

const HelpCenterPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [filteredFAQs, setFilteredFAQs] = useState([]);

  const categories = [
    { id: 'all', name: 'All Topics', icon: HelpCircle, color: 'bg-blue-500' },
    { id: 'getting-started', name: 'Getting Started', icon: BookOpen, color: 'bg-green-500' },
    { id: 'shipments', name: 'Shipments', icon: Truck, color: 'bg-purple-500' },
    { id: 'account', name: 'Account & Billing', icon: User, color: 'bg-orange-500' },
    { id: 'technical', name: 'Technical Support', icon: Settings, color: 'bg-red-500' },
    { id: 'safety', name: 'Safety & Security', icon: Shield, color: 'bg-indigo-500' }
  ];

  const faqs = [
    {
      id: 1,
      category: 'getting-started',
      question: 'How do I create an account on RoamEase?',
      answer: 'Creating an account is simple! Click the "Sign Up" button on our homepage, fill in your details, verify your email address, and you\'re ready to start shipping. You can choose between a Shipper account (to post shipments) or a Logistics Provider account (to bid on shipments).',
      popular: true
    },
    {
      id: 2,
      category: 'getting-started',
      question: 'What\'s the difference between a Shipper and Logistics Provider account?',
      answer: 'Shippers post their cargo shipments and receive bids from logistics companies. Logistics Providers browse available shipments and place competitive bids to win shipping contracts. You can switch between roles or maintain both types of accounts.',
      popular: true
    },
    {
      id: 3,
      category: 'shipments',
      question: 'How do I post a shipment?',
      answer: 'After logging in, go to your dashboard and click "Post New Shipment". Fill in the shipment details including pickup/delivery locations, cargo description, weight, dimensions, and preferred delivery date. Set your budget and publish the shipment to receive bids.',
      popular: true
    },
    {
      id: 4,
      category: 'shipments',
      question: 'How does the bidding process work?',
      answer: 'Logistics providers can view your shipment details and submit competitive bids. You\'ll receive notifications for new bids and can compare prices, delivery times, and provider ratings. Accept the best bid to start your shipment journey.',
      popular: false
    },
    {
      id: 5,
      category: 'shipments',
      question: 'Can I track my shipment in real-time?',
      answer: 'Yes! Once your shipment is accepted, you\'ll receive real-time updates on its location and status. Our tracking system provides GPS coordinates, estimated delivery times, and photo confirmations at key milestones.',
      popular: true
    },
    {
      id: 6,
      category: 'account',
      question: 'How do I update my profile information?',
      answer: 'Go to your dashboard, click on "Profile" or "Settings", and update your personal information, contact details, or business information. Changes are saved automatically and take effect immediately.',
      popular: false
    },
    {
      id: 7,
      category: 'account',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), bank transfers, and digital wallets. All payments are processed securely through our encrypted payment system with fraud protection.',
      popular: true
    },
    {
      id: 8,
      category: 'account',
      question: 'How do subscription plans work?',
      answer: 'We offer flexible subscription plans for frequent users. Basic plans provide essential features at an affordable rate, while Premium plans offer unlimited shipments, priority support, and advanced analytics. You can upgrade or downgrade anytime.',
      popular: false
    },
    {
      id: 9,
      category: 'technical',
      question: 'The app is running slowly. What should I do?',
      answer: 'Try refreshing your browser or clearing your cache. If the issue persists, check your internet connection or try using a different browser. For mobile apps, ensure you have the latest version installed.',
      popular: false
    },
    {
      id: 10,
      category: 'technical',
      question: 'I\'m having trouble uploading documents. What can I do?',
      answer: 'Ensure your files are in supported formats (PDF, JPG, PNG) and under 10MB. Check your internet connection and try again. If problems persist, contact our technical support team for assistance.',
      popular: false
    },
    {
      id: 11,
      category: 'safety',
      question: 'How do you verify logistics providers?',
      answer: 'All logistics providers undergo a thorough verification process including business license verification, insurance validation, background checks, and customer review analysis. Only verified providers can bid on shipments.',
      popular: true
    },
    {
      id: 12,
      category: 'safety',
      question: 'What happens if my cargo is damaged during transit?',
      answer: 'We have comprehensive insurance coverage for all shipments. In case of damage, report it immediately through our platform. We\'ll investigate the claim and ensure you receive appropriate compensation according to our terms.',
      popular: true
    }
  ];

  const popularFAQs = faqs.filter(faq => faq.popular);

  useEffect(() => {
    let filtered = faqs;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredFAQs(filtered);
  }, [searchQuery, selectedCategory]);

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm"
          >
            <HelpCircle className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Help Center
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl text-blue-100 max-w-3xl mx-auto mb-8"
          >
            Find answers to your questions and get the most out of RoamEase
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="max-w-2xl mx-auto relative"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-0 text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-white/30 focus:outline-none shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 rounded-2xl text-center transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-white shadow-lg border-2 border-blue-500'
                      : 'bg-white/80 hover:bg-white hover:shadow-md border border-gray-200'
                  }`}
                >
                  <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{category.name}</p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Popular FAQs */}
        {selectedCategory === 'all' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Popular Questions</h2>
            </div>
            <div className="grid gap-4">
              {popularFAQs.map((faq) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * faq.id, duration: 0.5 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <span className="font-semibold text-gray-900 dark:text-white pr-4">{faq.question}</span>
                    {expandedFAQ === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedFAQ === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filtered FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {selectedCategory === 'all' ? 'All Questions' : categories.find(c => c.id === selectedCategory)?.name}
          </h2>
          
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">No results found</h3>
              <p className="text-gray-400">Try adjusting your search or browse different categories</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredFAQs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <span className="font-semibold text-gray-900 dark:text-white pr-4">{faq.question}</span>
                    {expandedFAQ === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedFAQ === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Contact Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-8 md:p-12 text-white text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Our support team is here to help you 24/7. Get in touch with us through any of these channels.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/30 transition-colors duration-300"
              >
                <MessageSquare className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Live Chat</h3>
                <p className="text-sm text-blue-100">Get instant help from our support team</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/30 transition-colors duration-300"
              >
                <Mail className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-sm text-blue-100">da9783790@gmail.com</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/30 transition-colors duration-300"
              >
                <Phone className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Phone Support</h3>
                <p className="text-sm text-blue-100">+2347042168616</p>
              </motion.div>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-colors duration-300 shadow-lg"
              >
                Contact Support
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
