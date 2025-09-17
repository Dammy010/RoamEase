import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Footer from '../components/shared/Footer';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  Truck, Package, Globe, Shield, Users, Award, Star, 
  CheckCircle, ArrowRight, Heart, Target, Zap, Clock, 
  TrendingUp, Handshake, MapPin, Phone, Mail
} from 'lucide-react';

const AboutPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const values = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Trust & Security",
      description: "We partner only with verified logistics companies to ensure your goods are safe and secure throughout the journey."
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-600" />,
      title: "Efficiency",
      description: "We streamline communication and tracking to save you time and money with our advanced logistics technology."
    },
    {
      icon: <Target className="w-8 h-8 text-green-600" />,
      title: "Transparency",
      description: "Clear pricing, real-time updates, and honest communication at every step of your logistics journey."
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "Community",
      description: "Building a trusted network of shippers and logistics providers working together for mutual success."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Successful Shipments" },
    { number: "500+", label: "Verified Partners" },
    { number: "50+", label: "Cities Covered" },
    { number: "99.5%", label: "On-Time Delivery" }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-blue-600 text-white py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight"
          >
            About RoamEase
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 max-w-4xl mx-auto mb-6 sm:mb-8"
          >
            Connecting cargo owners with trusted logistics partners for seamless delivery across Nigeria and beyond.
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
              onClick={() => navigate("/signup")}
              className="bg-white text-blue-700 font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300 text-sm sm:text-base"
            >
              Join Our Platform
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/contact")}
              className="bg-transparent border-2 border-white text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg hover:bg-white hover:text-blue-700 transition duration-300 text-sm sm:text-base"
            >
              Contact Us
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-16 bg-gray-50 dark:bg-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium text-xs sm:text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Story Section */}
      <motion.section
        ref={ref}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="py-20 bg-white dark:bg-gray-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Left Side - Image */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={isInView ? { x: 0, opacity: 1 } : { x: -50, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="https://amertranslogistics.com/wp-content/uploads/2022/06/Transport-logistics.jpg"
                  alt="Logistics Team"
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover"
            />
          </div>
              <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-blue-600 text-white p-4 sm:p-6 rounded-2xl shadow-lg">
                <div className="text-lg sm:text-2xl font-bold">5+</div>
                <div className="text-xs sm:text-sm">Years Experience</div>
              </div>
            </motion.div>

            {/* Right Side - Content */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={isInView ? { x: 0, opacity: 1 } : { x: 50, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Our Story
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-4 sm:mb-6">
                RoamEase was born from a simple observation: the logistics industry in Nigeria was fragmented, 
                inefficient, and lacked transparency. We saw an opportunity to revolutionize how cargo owners 
                connect with logistics providers.
              </p>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6 sm:mb-8">
                Today, we're proud to be the leading logistics coordination platform, connecting thousands of 
                shippers with verified logistics partners across Nigeria and beyond. Our mission is to make 
                logistics simple, transparent, and accessible to everyone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/services")}
                  className="bg-blue-600 text-white font-semibold py-3 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition duration-300 text-sm sm:text-base"
                >
                  Our Services
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/contact")}
                  className="bg-transparent border-2 border-blue-600 text-blue-600 font-semibold py-3 px-4 sm:px-6 rounded-lg hover:bg-blue-600 hover:text-white transition duration-300 text-sm sm:text-base"
                >
                  Get in Touch
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Values Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 bg-gray-50 dark:bg-gray-800"
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
              Our Core Values
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              These principles guide everything we do and shape how we serve our community of shippers and logistics providers.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center"
              >
                <div className="flex justify-center mb-6">
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full">
                    {value.icon}
            </div>
            </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  {value.description}
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
        className="py-20 bg-blue-600 text-white"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6"
          >
            Ready to Join Our Community?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-gray-200"
          >
            Whether you're a shipper looking for reliable logistics partners or a logistics provider seeking new opportunities, 
            RoamEase is here to help you succeed.
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
              Get Started Today
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/contact")}
              className="bg-transparent border-2 border-white text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg hover:bg-white hover:text-blue-700 transition duration-300 text-sm sm:text-base"
            >
              Contact Our Team
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default AboutPage;