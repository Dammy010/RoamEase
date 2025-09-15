import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Footer from '../components/shared/Footer';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';

const FAQPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    {
      category: 'Getting Started',
      question: 'How do I create an account?',
      answer: 'To create an account, click on the "Sign Up" button in the top right corner of the homepage and follow the instructions. You can sign up as either a shipper or a logistics provider.',
    },
    {
      category: 'Getting Started',
      question: 'What information do I need to provide during registration?',
      answer: 'For shippers, you need basic contact information and business details. For logistics providers, you need company registration, insurance documents, and verification of your logistics license.',
    },
    {
      category: 'Shipments',
      question: 'How do I post a shipment?',
      answer: 'After logging in, navigate to the "Post Shipment" section in your dashboard. Fill out the required details about your cargo, destination, pickup location, and other specifications. You can also set your budget and preferred timeline.',
    },
    {
      category: 'Shipments',
      question: 'What types of cargo can I ship?',
      answer: 'You can ship various types of cargo including packages, pallets, containers, and bulk goods. However, we do not handle hazardous materials, perishables, or illegal items. Please check our terms of service for the complete list.',
    },
    {
      category: 'Providers',
      question: 'How do I find logistics providers?',
      answer: 'Once you post a shipment, verified logistics providers will bid on your shipment. You can review their bids, ratings, and profiles to choose the best one for your needs. You can also browse available providers in our directory.',
    },
    {
      category: 'Providers',
      question: 'How do I become a logistics provider?',
      answer: 'Click on "Become a Provider" and complete the registration process. You will need to provide company documents, insurance certificates, and undergo verification. Once approved, you can start bidding on shipments.',
    },
    {
      category: 'Bidding',
      question: 'How does the bidding process work?',
      answer: 'Logistics providers submit bids for your posted shipment with their proposed price and timeline. You can view all bids, compare prices and services, and accept the bid that best suits your requirements. Once a bid is accepted, the shipment process begins.',
    },
    {
      category: 'Bidding',
      question: 'Can I negotiate with providers?',
      answer: 'Yes, you can communicate directly with providers through our built-in chat system to discuss details, negotiate terms, and ask questions before accepting a bid.',
    },
    {
      category: 'Payments',
      question: 'How do payments work?',
      answer: 'We use Stripe for secure payment processing. Payments are held in escrow until the shipment is completed successfully. You can pay using credit cards, bank transfers, or other supported payment methods.',
    },
    {
      category: 'Payments',
      question: 'When do I get charged?',
      answer: 'You are charged when you accept a bid from a logistics provider. The payment is held securely until the shipment is delivered and confirmed. If there are any issues, our dispute resolution system will help resolve them.',
    },
    {
      category: 'Support',
      question: 'What if I have an issue with my shipment?',
      answer: 'Our platform includes a comprehensive dispute resolution system. You can also contact our support team directly through the Help Center, live chat, or by email. We aim to resolve all issues within 24-48 hours.',
    },
    {
      category: 'Support',
      question: 'How can I track my shipment?',
      answer: 'You can track your shipment in real-time through our platform. Providers update the status regularly, and you will receive notifications at key milestones. You can also contact the provider directly for updates.',
    },
    {
      category: 'Security',
      question: 'Is my personal information secure?',
      answer: 'Yes, we prioritize the security of your data using industry-standard encryption and security measures. Please refer to our Privacy Policy for detailed information on how we collect, use, and protect your personal information.',
    },
    {
      category: 'Security',
      question: 'Are all providers verified?',
      answer: 'Yes, all logistics providers undergo a thorough verification process including background checks, license verification, and insurance validation. We continuously monitor their performance and ratings.',
    },
  ];

  const categories = ['All', 'Getting Started', 'Shipments', 'Providers', 'Bidding', 'Payments', 'Support', 'Security'];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = searchTerm ? true : true; // For now, show all when searching
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center mb-4 sm:mb-6"
          >
            <div className="bg-white/20 p-3 sm:p-4 rounded-full">
              <HelpCircle className="w-8 h-8 sm:w-12 sm:h-12" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight"
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 max-w-4xl mx-auto mb-6 sm:mb-8"
          >
            Find answers to common questions about RoamEase. Can't find what you're looking for? Contact our support team.
          </motion.p>
        </div>
      </motion.section>

      {/* Search Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="py-12 bg-gray-50 dark:bg-gray-800"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        ref={ref}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="py-20 bg-white dark:bg-gray-900"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Common Questions
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
              Browse through our frequently asked questions to find quick answers.
            </p>
          </motion.div>

        <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
              >
                <motion.button
                  whileHover={{ backgroundColor: isDark ? '#374151' : '#f9fafb' }}
                  className="flex justify-between items-center w-full px-4 sm:px-6 py-4 sm:py-6 text-left focus:outline-none transition-colors duration-200"
                  onClick={() => toggleFAQ(index)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold px-3 py-1 rounded-full">
                        {faq.category}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {faq.question}
                    </h3>
                  </div>
                <ChevronDown
                    className={`h-6 w-6 text-gray-500 dark:text-gray-400 transform transition-transform duration-200 ${
                      openIndex === index ? 'rotate-180' : 'rotate-0'
                    }`}
                />
                </motion.button>
              {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-100 dark:border-gray-700"
                  >
                    <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </motion.div>
          ))}
        </div>

          {filteredFAQs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Try searching with different keywords or contact our support team.
              </p>
            </motion.div>
          )}
        </div>
      </motion.section>


      <Footer />
    </div>
  );
};

export default FAQPage;