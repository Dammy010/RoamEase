import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, CheckCircle, AlertCircle, Shield, 
  Users, Settings, Globe, Clock, Lock, ChevronDown,
  ChevronUp, Mail, Phone, MapPin, Calendar, Scale,
  Eye, EyeOff, BookOpen, ArrowRight, ExternalLink
} from 'lucide-react';

const TermsOfServicePage = () => {
  const [expandedSections, setExpandedSections] = useState({});
  const [lastUpdated, setLastUpdated] = useState('January 15, 2025');

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const termsSections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      icon: CheckCircle,
      content: `By accessing or using the RoamEase platform ("Service"), you agree to be bound by these Terms of Service ("Terms") and all terms incorporated by reference. If you do not agree to all of these terms, do not use our platform.

These Terms constitute a legally binding agreement between you and RoamEase. Your use of the Service is also governed by our Privacy Policy, which is incorporated by reference into these Terms.`
    },
    {
      id: 'definitions',
      title: '2. Definitions',
      icon: BookOpen,
      content: `For the purposes of these Terms:

• "Platform" or "Service" means the RoamEase logistics platform and all related services
• "User" means any individual or entity that accesses or uses the Platform
• "Shipper" means a user who posts cargo shipments for transportation
• "Logistics Provider" means a user who provides transportation and logistics services
• "Content" means any data, text, images, or other materials uploaded to the Platform
• "Account" means the user account created to access the Platform`
    },
    {
      id: 'changes',
      title: '3. Changes to Terms',
      icon: Settings,
      content: `We reserve the right to modify these Terms at any time. All changes will be effective immediately upon posting to our website. Your continued use of the Platform after such changes constitutes your acceptance of the new Terms.

We will notify users of material changes via email or through the Platform. It is your responsibility to review these Terms periodically for any changes.`
    },
    {
      id: 'accounts',
      title: '4. User Accounts',
      icon: Users,
      content: `You must create an account to access certain features of the Platform. You are responsible for:

• Maintaining the confidentiality of your account credentials
• All activities that occur under your account
• Providing accurate and complete information during registration
• Updating your account information to keep it current
• Notifying us immediately of any unauthorized use of your account

You may not create multiple accounts or share your account credentials with others.`
    },
    {
      id: 'user-responsibilities',
      title: '5. User Responsibilities',
      icon: Shield,
      content: `You agree to use the Platform only for lawful purposes and in accordance with these Terms. You are responsible for:

• All content you post and all activities you undertake on the Platform
• Ensuring all information provided is accurate and truthful
• Complying with all applicable laws and regulations
• Respecting the rights of other users
• Not engaging in fraudulent, deceptive, or harmful activities
• Not interfering with the proper functioning of the Platform`
    },
    {
      id: 'prohibited-uses',
      title: '6. Prohibited Uses',
      icon: AlertCircle,
      content: `You may not use the Platform:

• For any unlawful purpose or to solicit others to perform unlawful acts
• To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances
• To infringe upon or violate our intellectual property rights or the intellectual property rights of others
• To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate
• To submit false or misleading information
• To upload or transmit viruses or any other type of malicious code
• To spam, phish, pharm, pretext, spider, crawl, or scrape
• For any obscene or immoral purpose
• To interfere with or circumvent the security features of the Platform`
    },
    {
      id: 'content-ownership',
      title: '7. Content Ownership and Rights',
      icon: Lock,
      content: `You retain ownership of all content you upload to the Platform. However, by uploading content, you grant RoamEase a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content in connection with the Platform.

You represent and warrant that:
• You own or have the right to use all content you upload
• Your content does not infringe on any third-party rights
• Your content complies with these Terms and applicable laws`
    },
    {
      id: 'payment-terms',
      title: '8. Payment Terms',
      icon: Scale,
      content: `Payment terms for our services are as follows:

• Subscription fees are billed in advance on a recurring basis
• All fees are non-refundable unless otherwise specified
• We reserve the right to change our pricing with 30 days' notice
• Payment disputes must be raised within 30 days of the billing date
• We may suspend or terminate accounts for non-payment
• All prices are exclusive of applicable taxes`
    },
    {
      id: 'disclaimers',
      title: '9. Disclaimers',
      icon: AlertCircle,
      content: `The RoamEase platform is provided on an "as is" and "as available" basis, without warranties of any kind, either express or implied, including, but not limited to:

• Implied warranties of merchantability
• Fitness for a particular purpose
• Non-infringement
• Accuracy, reliability, or completeness of information
• Uninterrupted or error-free operation

We do not warrant that the Platform will be available at all times or that it will be free from errors or defects.`
    },
    {
      id: 'limitation-liability',
      title: '10. Limitation of Liability',
      icon: Shield,
      content: `In no event shall RoamEase, its affiliates, or their licensors, service providers, employees, agents, officers, or directors be liable for damages of any kind, under any legal theory, arising out of or in connection with your use, or inability to use, the Platform, including:

• Direct, indirect, special, incidental, or consequential damages
• Loss of profits, data, or other intangible losses
• Damages resulting from unauthorized access to your account
• Damages resulting from any conduct or content of any third party

Our total liability to you for any damages shall not exceed the amount you paid us in the 12 months preceding the claim.`
    },
    {
      id: 'governing-law',
      title: '11. Governing Law',
      icon: Globe,
      content: `These Terms shall be governed by and construed in accordance with the laws of the jurisdiction where RoamEase is headquartered, without regard to its conflict of law principles.

Any legal action or proceeding arising under these Terms will be brought exclusively in the courts of competent jurisdiction in our headquarters location.`
    },
    {
      id: 'contact',
      title: '12. Contact Information',
      icon: Mail,
      content: `If you have any questions about these Terms of Service, please contact us:

Email: da9783790@gmail.com
Phone: +2347042168616
Address: 123 Logistics Drive, Suite 400, Transport City, TX 75001

We will respond to all inquiries within 48 hours during business days.`
    }
  ];

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
            <FileText className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Terms of Service
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl text-blue-100 max-w-3xl mx-auto mb-8"
          >
            Please read these Terms of Service carefully before using the RoamEase platform
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-blue-200"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {lastUpdated}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Effective immediately</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Table of Contents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Table of Contents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {termsSections.map((section, index) => (
              <motion.button
                key={section.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleSection(section.id)}
                className="text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <section.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {section.title}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Terms Sections */}
        <div className="space-y-6">
          {termsSections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <section.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {section.title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Click to {expandedSections[section.id] ? 'collapse' : 'expand'} section
                    </p>
                  </div>
                </div>
                {expandedSections[section.id] ? (
                  <ChevronUp className="w-6 h-6 text-gray-500" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-500" />
                )}
              </button>
              
              <AnimatePresence>
                {expandedSections[section.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {section.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-8 md:p-12 text-white text-center mt-12"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-4">Questions About These Terms?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Our legal team is here to help clarify any questions you may have about our Terms of Service.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/30 transition-colors duration-300"
              >
                <Mail className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Email Us</h3>
                <p className="text-sm text-blue-100">da9783790@gmail.com</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/30 transition-colors duration-300"
              >
                <Phone className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Call Us</h3>
                <p className="text-sm text-blue-100">+2347042168616</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/30 transition-colors duration-300"
              >
                <MapPin className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Visit Us</h3>
                <p className="text-sm text-blue-100">123 Logistics Drive, Suite 400</p>
              </motion.div>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a
                href="mailto:da9783790@gmail.com"
                className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-colors duration-300 shadow-lg"
              >
                Contact Legal Team
                <ArrowRight className="w-5 h-5" />
              </a>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
