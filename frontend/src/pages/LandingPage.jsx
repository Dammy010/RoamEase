import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import Footer from "../components/shared/Footer";
import { motion, useInView, useAnimation } from "framer-motion";
import { useRef } from "react";
import {
  FaBox,
  FaComments,
  FaCreditCard,
  FaMapMarkerAlt,
  FaClock,
  FaShieldAlt,
  FaUserPlus,
  FaHandshake,
  FaTruck,
} from "react-icons/fa";

const LandingPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const controls = useAnimation();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const slideInVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const scaleVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 py-6">
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative flex flex-col-reverse lg:flex-row items-center justify-center min-h-[90vh] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white px-4 sm:px-6 lg:px-16 gap-8 lg:gap-10 overflow-hidden"
      >
        {/* Background Animation Elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 2, delay: 1 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-y-12"
        />

        {/* Left Content */}
        <motion.div
          variants={slideInVariants}
          className="flex-1 text-center lg:text-left z-10"
        >
          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight drop-shadow-lg"
          >
            Connect With Global Logistics Providers Instantly
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl mb-6 sm:mb-8"
          >
            RoamEase is the online marketplace where shippers post requests and
            licensed providers bid to fulfill them no middlemen.
          </motion.p>
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
          >
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/browse-shipments")}
              className="bg-white dark:bg-gray-800 text-blue-700 font-semibold py-3 px-6 sm:px-8 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300 text-sm sm:text-base"
            >
              Browse Open Shipments
            </motion.button>
            <motion.button
              whileHover={{
                scale: 1.05,
                backgroundColor: "white",
                color: "#1E40AF",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/signup")}
              className="bg-transparent border-2 border-white text-white font-semibold py-3 px-6 sm:px-8 rounded-lg hover:bg-white hover:text-blue-700 transition duration-300 text-sm sm:text-base"
            >
              Get Started Now
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right Image */}
        <motion.div
          variants={scaleVariants}
          className="flex-1 flex justify-center z-10"
        >
          <motion.img
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ duration: 0.3 }}
            src="https://intradefairs.com/sites/default/files/news/0Digitalize%20Logistics.jpg"
            alt="Global Logistics"
            className="w-full max-w-sm sm:max-w-md lg:max-w-lg rounded-2xl shadow-2xl"
          />
        </motion.div>
      </motion.section>

      {/* Why Choose RoamEase */}
      <motion.section
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={containerVariants}
        className="py-12 sm:py-16 text-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800"
      >
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 dark:text-white px-4">
            Why Choose RoamEase?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto px-4 text-sm sm:text-base">
            Our platform offers comprehensive features designed to make
            logistics management efficient, secure, and hassle-free.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto px-4 sm:px-6">
          {[
            {
              icon: <FaBox />,
              title: "Easy Shipment Posting",
              desc: "Post your cargo details and get competitive bids from verified logistics companies.",
            },
            {
              icon: <FaComments />,
              title: "Real-time Communication",
              desc: "Chat directly with logistics partners for seamless coordination and updates.",
            },
            {
              icon: <FaCreditCard />,
              title: "Secure Payments",
              desc: "Integrated payment system with Stripe for safe and reliable transactions.",
            },
            {
              icon: <FaMapMarkerAlt />,
              title: "Location Tracking",
              desc: "Track your shipments in real-time with integrated mapping services.",
            },
            {
              icon: <FaClock />,
              title: "24/7 Support",
              desc: "Round-the-clock customer support to help you with any issues or questions.",
            },
            {
              icon: <FaShieldAlt />,
              title: "Verified Partners",
              desc: "All logistics companies are thoroughly verified and background-checked.",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                y: -5,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
              className="bg-white dark:bg-gray-800 backdrop-blur-sm shadow-lg rounded-xl p-4 sm:p-6 text-left flex items-start gap-3 sm:gap-4 hover:shadow-2xl transition-all duration-300 border border-white/20 dark:border-gray-700/50"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="text-blue-600 dark:text-blue-400 text-2xl"
              >
                {feature.icon}
              </motion.div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="py-12 sm:py-16 text-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden"
      >
        {/* Background Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform rotate-12"
        />

        <motion.div variants={itemVariants}>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white px-4 relative z-10">
            How It Works
          </h2>
          <p className="text-blue-100 mb-8 sm:mb-12 max-w-2xl mx-auto px-4 text-sm sm:text-base relative z-10">
            Get started with RoamEase in four simple steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          {[
            {
              icon: <FaUserPlus />,
              title: "Sign Up",
              desc: "Create your account as a shipper or logistics company.",
              color: "from-blue-500 to-blue-600",
            },
            {
              icon: <FaBox />,
              title: "Post Shipment",
              desc: "Shippers post cargo details and requirements.",
              color: "from-green-500 to-green-600",
            },
            {
              icon: <FaHandshake />,
              title: "Receive Bids",
              desc: "Verified logistics companies submit competitive bids.",
              color: "from-purple-500 to-purple-600",
            },
            {
              icon: <FaTruck />,
              title: "Ship & Track",
              desc: "Accept the best bid and track your shipment in real-time.",
              color: "from-orange-500 to-orange-600",
            },
          ].map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                y: -10,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
              className="flex flex-col items-center text-center transition-transform bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl border border-white/50 dark:border-gray-700/50"
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className={`bg-gradient-to-r ${step.color} text-white rounded-full p-3 sm:p-4 text-2xl sm:text-3xl mb-3 sm:mb-4 shadow-lg`}
              >
                {step.icon}
              </motion.div>
              <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900 dark:text-white">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-16 sm:py-20 bg-blue-50 dark:bg-gray-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-4">
              Choose the perfect plan for your logistics needs. No hidden fees,
              no surprises.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-3xl mx-auto">
              <p className="text-blue-800 dark:text-blue-200 font-medium text-center">
                📋 <strong>For Logistics Providers:</strong> Subscription
                required before verification and bidding on shipments
              </p>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {/* Basic Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-900 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300"
            >
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FaShieldAlt className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Basic
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                  Perfect for small businesses
                </p>
                <div className="mb-4 sm:mb-6">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                    ₦45,600
                  </span>
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    /month
                  </span>
                </div>
                <ul className="text-left space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  <li className="flex items-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    <FaBox className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                    Up to 50 shipments/month
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    <FaComments className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                    Email support
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    <FaMapMarkerAlt className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                    Basic tracking
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Premium Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-900 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-blue-500/50 dark:border-blue-400/50 relative scale-105 hover:shadow-3xl transition-all duration-300"
            >
              <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FaHandshake className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Premium
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                  Ideal for growing businesses
                </p>
                <div className="mb-4 sm:mb-6">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                    ₦65,600
                  </span>
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    /month
                  </span>
                </div>
                <ul className="text-left space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  <li className="flex items-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    <FaBox className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                    Unlimited shipments
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    <FaComments className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                    Priority support
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    <FaMapMarkerAlt className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                    Advanced tracking
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    <FaCreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                    Custom integrations
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-900 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300"
            >
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FaTruck className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Enterprise
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                  For large-scale operations
                </p>
                <div className="mb-4 sm:mb-6">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                    ₦150,600
                  </span>
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    /month
                  </span>
                </div>
                <ul className="text-left space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  <li className="flex items-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    <FaBox className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                    Everything unlimited
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    <FaComments className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                    24/7 dedicated support
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    <FaMapMarkerAlt className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                    White-label solutions
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    <FaUserPlus className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                    Dedicated manager
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/pricing")}
              className="bg-blue-600 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl text-base sm:text-lg"
            >
              View Full Pricing Details
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-12 sm:py-16 bg-blue-600 text-white text-center"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
            Ready to Streamline Your Logistics?
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8">
            Join thousands of shippers and logistics companies who trust
            RoamEase for their cargo transportation needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/browse-shipments")}
              className="bg-white dark:bg-gray-800 text-blue-700 font-semibold py-3 px-6 sm:px-8 rounded-lg hover:bg-gray-100 transition duration-300 text-sm sm:text-base"
            >
              Browse Open Shipments
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/signup")}
              className="bg-transparent border-2 border-white text-white font-semibold py-3 px-6 sm:px-8 rounded-lg hover:bg-white hover:text-blue-700 transition duration-300 text-sm sm:text-base"
            >
              Get Started Now
            </motion.button>
          </div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default LandingPage;
