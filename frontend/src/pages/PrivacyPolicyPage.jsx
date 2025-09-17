import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Lock, Eye, FileText, CheckCircle, 
  AlertCircle, Users, Settings, Globe, Clock, ChevronDown,
  ChevronUp, Mail, Phone, MapPin, Calendar, Database,
  EyeOff, Key, Server, UserCheck, ArrowRight, ExternalLink,
  BookOpen, Search, Filter, Download, Trash2, Edit
} from 'lucide-react';

const PrivacyPolicyPage = () => {
  const [expandedSections, setExpandedSections] = useState({});
  const [lastUpdated, setLastUpdated] = useState('January 15, 2025');

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const privacySections = [
    {
      id: 'introduction',
      title: '1. Introduction',
      icon: FileText,
      content: `At RoamEase, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our logistics platform.

This policy applies to all users of our services, including shippers, logistics providers, and visitors to our website. By using our platform, you consent to the data practices described in this policy.`
    },
    {
      id: 'information-collection',
      title: '2. Information We Collect',
      icon: Database,
      content: `We collect various types of information to provide and improve our services:

Personal Information:
• Name, email address, phone number, and physical address
• Payment information and billing details
• Government identification (for logistics providers)
• Business registration documents and licenses
• Profile pictures and company logos

Usage Data:
• IP address, browser type, and device information
• Pages visited, time spent on our platform
• Search queries and navigation patterns
• Click-through rates and user interactions
• Error logs and performance data

Location Data:
• GPS coordinates for shipment tracking
• Pickup and delivery locations
• Real-time location updates during transit
• Geographic preferences and service areas

Communication Data:
• Messages sent through our platform
• Customer support interactions
• Feedback and reviews
• Marketing communication preferences`
    },
    {
      id: 'how-we-use',
      title: '3. How We Use Your Information',
      icon: Settings,
      content: `We use your information for the following purposes:

Service Provision:
• To provide, operate, and maintain our logistics platform
• To process shipments and facilitate logistics services
• To match shippers with appropriate logistics providers
• To enable real-time tracking and communication
• To process payments and manage billing

Platform Improvement:
• To analyze usage patterns and improve our services
• To develop new features and functionality
• To personalize your experience on our platform
• To conduct research and analytics
• To optimize our algorithms and matching systems

Communication:
• To send you important updates about your shipments
• To provide customer support and respond to inquiries
• To send marketing communications (with your consent)
• To notify you of changes to our services
• To conduct surveys and gather feedback

Legal and Security:
• To comply with legal obligations and regulations
• To prevent fraud and ensure platform security
• To enforce our terms of service
• To protect the rights and safety of our users
• To respond to legal requests and court orders`
    },
    {
      id: 'information-sharing',
      title: '4. Information Sharing and Disclosure',
      icon: Users,
      content: `We may share your information in the following circumstances:

Service Providers:
• Payment processors and financial institutions
• Cloud hosting and data storage providers
• Analytics and marketing service providers
• Customer support and communication tools
• Third-party logistics and shipping partners

Business Partners:
• Logistics providers (limited to necessary information for service delivery)
• Insurance companies (for coverage and claims)
• Government agencies (for compliance and reporting)
• Business partners (with your explicit consent)

Legal Requirements:
• When required by law or legal process
• To protect our rights and property
• To prevent fraud or illegal activities
• To ensure user safety and security
• In case of business transfers or mergers

We never sell your personal information to third parties for marketing purposes.`
    },
    {
      id: 'data-security',
      title: '5. Data Security',
      icon: Shield,
      content: `We implement comprehensive security measures to protect your information:

Technical Safeguards:
• End-to-end encryption for sensitive data
• Secure socket layer (SSL) technology
• Regular security audits and penetration testing
• Multi-factor authentication for account access
• Secure data centers with 24/7 monitoring

Administrative Safeguards:
• Limited access to personal information
• Regular staff training on data protection
• Strict confidentiality agreements
• Incident response procedures
• Regular security policy reviews

Physical Safeguards:
• Secure server facilities with restricted access
• Environmental controls and backup systems
• Secure disposal of physical documents
• Access logging and monitoring
• Disaster recovery procedures

While we strive to protect your information, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security but continuously work to improve our security measures.`
    },
    {
      id: 'data-retention',
      title: '6. Data Retention',
      icon: Clock,
      content: `We retain your information for as long as necessary to provide our services and comply with legal obligations:

Account Information:
• Active accounts: Retained while account is active
• Inactive accounts: Retained for 3 years after last activity
• Deleted accounts: Data purged after 30 days

Transaction Data:
• Shipment records: Retained for 7 years for legal compliance
• Payment information: Retained as required by financial regulations
• Communication logs: Retained for 2 years

Marketing Data:
• Marketing preferences: Retained until you opt out
• Newsletter subscriptions: Retained until you unsubscribe
• Survey responses: Retained for 2 years

Legal Requirements:
• Some data may be retained longer for legal compliance
• Court orders may require extended retention periods
• Regulatory requirements may dictate retention periods

You may request deletion of your data at any time, subject to legal and operational requirements.`
    },
    {
      id: 'your-rights',
      title: '7. Your Data Protection Rights',
      icon: UserCheck,
      content: `Depending on your location, you have the following rights regarding your personal data:

Access Rights:
• Request copies of your personal information
• Know what information we have about you
• Understand how we use your information
• Receive information in a portable format

Control Rights:
• Update or correct inaccurate information
• Delete your personal information
• Restrict how we process your data
• Object to certain types of processing

Communication Rights:
• Opt out of marketing communications
• Choose your communication preferences
• Request data portability
• Withdraw consent at any time

To exercise these rights, contact us at da9783790@gmail.com. We will respond to your request within 30 days.`
    },
    {
      id: 'cookies-tracking',
      title: '8. Cookies and Tracking Technologies',
      icon: Eye,
      content: `We use cookies and similar technologies to enhance your experience:

Essential Cookies:
• Required for platform functionality
• Enable secure authentication
• Remember your preferences
• Support core features

Analytics Cookies:
• Help us understand platform usage
• Improve our services and features
• Measure performance and effectiveness
• Generate anonymous usage statistics

Marketing Cookies:
• Personalize your experience
• Show relevant advertisements
• Track marketing campaign effectiveness
• Enable social media integration

You can control cookie settings through your browser preferences. However, disabling certain cookies may affect platform functionality.`
    },
    {
      id: 'international-transfers',
      title: '9. International Data Transfers',
      icon: Globe,
      content: `Your information may be transferred to and processed in countries other than your own:

Transfer Mechanisms:
• Adequacy decisions by relevant authorities
• Standard contractual clauses (SCCs)
• Binding corporate rules
• Explicit consent where required

Safeguards:
• Data protection agreements with all processors
• Regular compliance audits
• Encryption during transmission
• Secure data centers with appropriate safeguards

Countries of Processing:
• United States (primary data processing)
• European Union (for EU users)
• Other countries as necessary for service delivery

We ensure that all international transfers comply with applicable data protection laws and provide appropriate safeguards for your information.`
    },
    {
      id: 'children-privacy',
      title: '10. Children\'s Privacy',
      icon: Lock,
      content: `Our services are not intended for children under 16 years of age:

Age Restrictions:
• We do not knowingly collect information from children under 16
• Users must be at least 16 to create an account
• We verify age during the registration process
• Parents can request deletion of their child's information

If we discover we have collected information from a child under 16, we will:
• Delete the information immediately
• Notify the child's parent or guardian
• Take steps to prevent future collection
• Update our verification processes

If you believe we have collected information from a child under 16, please contact us immediately at da9783790@gmail.com.`
    },
    {
      id: 'policy-changes',
      title: '11. Changes to This Privacy Policy',
      icon: AlertCircle,
      content: `We may update this Privacy Policy from time to time:

Notification Methods:
• Email notification to registered users
• Prominent notice on our website
• In-app notifications for active users
• Updated "Last Modified" date

Material Changes:
• We will provide 30 days' notice for material changes
• You may opt out of new data practices
• Continued use constitutes acceptance of changes
• Previous versions available upon request

Minor Updates:
• Typographical corrections
• Clarifications of existing practices
• Updates to contact information
• Technical improvements

We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.`
    },
    {
      id: 'contact-information',
      title: '12. Contact Information',
      icon: Mail,
      content: `If you have any questions about this Privacy Policy or our data practices, please contact us:

Data Protection Officer:
Email: da9783790@gmail.com
Phone: +2347042168616
Address: 123 Logistics Drive, Suite 400, Transport City, TX 75001

Response Times:
• General inquiries: Within 48 hours
• Data subject requests: Within 30 days
• Security concerns: Within 24 hours
• Legal requests: As required by law

We are committed to addressing your privacy concerns promptly and transparently.`
    }
  ];

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
            <Shield className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Privacy Policy
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl text-blue-100 max-w-3xl mx-auto mb-8"
          >
            Your privacy is important to us. Learn how we collect, use, and protect your information.
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
              <Lock className="w-4 h-4" />
              <span>GDPR Compliant</span>
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
            {privacySections.map((section, index) => (
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

        {/* Privacy Sections */}
        <div className="space-y-6">
          {privacySections.map((section, index) => (
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
          className="bg-blue-600 rounded-3xl p-8 md:p-12 text-white text-center mt-12"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-4">Questions About Your Privacy?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Our privacy team is here to help you understand your rights and our data practices.
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
                Contact Privacy Team
                <ArrowRight className="w-5 h-5" />
              </a>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
