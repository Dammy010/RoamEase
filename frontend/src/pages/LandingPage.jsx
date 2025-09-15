import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import Footer from "../components/shared/Footer";
import { motion, useInView } from "framer-motion";
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 py-6">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative flex flex-col-reverse lg:flex-row items-center justify-center min-h-[90vh] bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white px-4 sm:px-6 lg:px-16 gap-8 lg:gap-10"
      >
        {/* Left Content */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 text-center lg:text-left"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight drop-shadow-lg">
            Connect With Global Logistics Providers Instantly
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl mb-6 sm:mb-8">
            RoamEase is the online marketplace where shippers post requests and licensed
            providers bid to fulfill them — no middlemen.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/browse-shipments")}
              className="bg-white dark:bg-gray-800 text-blue-700 font-semibold py-3 px-6 sm:px-8 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300 text-sm sm:text-base"
            >
              Browse Open Shipments
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/signup")}
              className="bg-yellow-400 text-gray-900 font-semibold py-3 px-6 sm:px-8 rounded-lg shadow-lg hover:bg-yellow-300 transition duration-300 text-sm sm:text-base"
            >
              Get Started Now
            </motion.button>
          </div>
        </motion.div>

        {/* Right Image */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex-1 flex justify-center"
        >
          <img
            src="https://intradefairs.com/sites/default/files/news/0Digitalize%20Logistics.jpg"
            alt="Global Logistics"
            className="w-full max-w-sm sm:max-w-md lg:max-w-lg rounded-2xl shadow-2xl"
          />
        </motion.div>
      </motion.section>

      {/* Why Choose RoamEase */}
      <motion.section
        ref={ref}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="py-12 sm:py-16 text-center bg-gray-50 dark:bg-gray-800"
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 dark:text-white px-4">
          Why Choose RoamEase?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto px-4 text-sm sm:text-base">
          Our platform offers comprehensive features designed to make logistics
          management efficient, secure, and hassle-free.
        </p>
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
              initial={{ y: 50, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white dark:bg-gray-800 dark:bg-gray-800 shadow-md rounded-lg p-4 sm:p-6 text-left flex items-start gap-3 sm:gap-4 hover:shadow-xl transition duration-300"
            >
              <div className="text-blue-600 dark:text-blue-400 text-2xl">{feature.icon}</div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-12 sm:py-16 text-center bg-white dark:bg-gray-800 dark:bg-gray-900"
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 dark:text-white px-4">How It Works</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto px-4 text-sm sm:text-base">
          Get started with RoamEase in four simple steps
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto px-4 sm:px-6">
          {[
            {
              icon: <FaUserPlus />,
              title: "Sign Up",
              desc: "Create your account as a shipper or logistics company.",
            },
            {
              icon: <FaBox />,
              title: "Post Shipment",
              desc: "Shippers post cargo details and requirements.",
            },
            {
              icon: <FaHandshake />,
              title: "Receive Bids",
              desc: "Verified logistics companies submit competitive bids.",
            },
            {
              icon: <FaTruck />,
              title: "Ship & Track",
              desc: "Accept the best bid and track your shipment in real-time.",
            },
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center text-center transition-transform"
            >
              <div className="bg-yellow-400 text-gray-900 rounded-full p-3 sm:p-4 text-2xl sm:text-3xl mb-3 sm:mb-4 shadow-lg">
                {step.icon}
              </div>
              <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900 dark:text-white">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-12 sm:py-16 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white text-center"
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
              className="bg-yellow-400 text-gray-900 font-semibold py-3 px-6 sm:px-8 rounded-lg hover:bg-yellow-300 transition duration-300 text-sm sm:text-base"
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