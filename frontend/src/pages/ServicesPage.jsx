import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import Footer from "../components/shared/Footer";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Truck, Ship, Plane, Warehouse, MapPin, Package, CheckCircle, Clock, Shield, Users } from "lucide-react";

const services = [
  {
    icon: <Truck className="w-12 h-12 text-blue-600" />,
    title: "Trucking & Road Transport",
    description: "Reliable long-haul and local road transport solutions for all shipment sizes with real-time tracking.",
    features: ["Local & Long-haul", "Real-time Tracking", "Flexible Scheduling", "Insurance Coverage"]
  },
  {
    icon: <Ship className="w-12 h-12 text-blue-600" />,
    title: "Sea Freight & Shipping",
    description: "International and domestic sea freight with door-to-port or door-to-door options for cost-effective transport.",
    features: ["International Routes", "Container Services", "Customs Clearance", "Port-to-Port Delivery"]
  },
  {
    icon: <Plane className="w-12 h-12 text-blue-600" />,
    title: "Air Freight & Express",
    description: "Fast, secure air cargo transport for urgent and high-value shipments with priority handling.",
    features: ["Express Delivery", "Priority Handling", "Global Network", "Same-day Options"]
  },
  {
    icon: <Warehouse className="w-12 h-12 text-blue-600" />,
    title: "Warehousing & Storage",
    description: "Secure storage facilities with inventory management and distribution services across multiple locations.",
    features: ["Climate Control", "Inventory Management", "Cross-docking", "Pick & Pack"]
  },
  {
    icon: <MapPin className="w-12 h-12 text-blue-600" />,
    title: "Last-Mile Delivery",
    description: "Efficient delivery to final destinations with tracking and proof of delivery for complete transparency.",
    features: ["Real-time Updates", "Proof of Delivery", "Flexible Time Slots", "Customer Notifications"]
  },
  {
    icon: <Package className="w-12 h-12 text-blue-600" />,
    title: "Logistics Planning",
    description: "Tailored supply chain strategies to optimize cost and delivery time with expert consultation.",
    features: ["Route Optimization", "Cost Analysis", "Risk Assessment", "Performance Metrics"]
  },
];

const benefits = [
  {
    icon: <CheckCircle className="w-8 h-8 text-green-600" />,
    title: "Verified Partners",
    description: "All logistics providers are thoroughly vetted and background-checked for reliability."
  },
  {
    icon: <Clock className="w-8 h-8 text-blue-600" />,
    title: "24/7 Support",
    description: "Round-the-clock customer support to help you with any logistics challenges."
  },
  {
    icon: <Shield className="w-8 h-8 text-purple-600" />,
    title: "Secure Payments",
    description: "Protected transactions with integrated payment systems and insurance coverage."
  },
  {
    icon: <Users className="w-8 h-8 text-orange-600" />,
    title: "Global Network",
    description: "Access to thousands of logistics partners worldwide for comprehensive coverage."
  }
];

const ServicesPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight"
          >
            Comprehensive Logistics Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 max-w-4xl mx-auto mb-6 sm:mb-8"
          >
            Connect with verified logistics providers worldwide for reliable, secure, and cost-effective transport solutions.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/browse-shipments")}
              className="bg-white text-blue-700 font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300 text-sm sm:text-base"
            >
              Browse Services
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/signup")}
              className="bg-transparent border-2 border-white text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg hover:bg-white hover:text-blue-700 transition duration-300 text-sm sm:text-base"
            >
              Get Started
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Services Grid */}
      <motion.section
        ref={ref}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="py-20 bg-gray-50 dark:bg-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Service Portfolio
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From local deliveries to international shipping, we provide comprehensive logistics solutions tailored to your business needs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 sm:p-8 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex justify-center mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full">
                    {service.icon}
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 text-center">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-center text-sm sm:text-base">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 bg-white dark:bg-gray-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We provide the tools and network you need to streamline your logistics operations and reduce costs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 sm:p-6"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6"
          >
            Ready to Transform Your Logistics?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-gray-200"
          >
            Join thousands of businesses already streamlining their logistics with RoamEase. Start your journey today.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/signup")}
              className="bg-white text-blue-700 font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300 text-sm sm:text-base"
            >
              Get Started Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/browse-shipments")}
              className="bg-transparent border-2 border-white text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg hover:bg-white hover:text-blue-700 transition duration-300 text-sm sm:text-base"
            >
              Browse Services
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default ServicesPage;