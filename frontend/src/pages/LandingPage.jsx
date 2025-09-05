import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/shared/Footer";
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="relative flex flex-col-reverse lg:flex-row items-center justify-center min-h-[90vh] bg-gradient-to-br from-blue-800 via-indigo-700 to-blue-600 text-white px-6 lg:px-16 gap-10">
  {/* Left Content */}
  <div className="flex-1 text-center lg:text-left">
    <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg">
      Connect With Global Logistics Providers Instantly
    </h1>
    <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mb-8">
      RoamEase is the online marketplace where shippers post requests and licensed
      providers bid to fulfill them — no middlemen.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
      <button
        onClick={() => navigate("/signup")}
        className="bg-yellow-400 text-gray-900 font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-yellow-300 transition duration-300"
      >
        Post a Shipment
      </button>
      <button
        onClick={() => navigate("/logistics-signup")}
        className="bg-transparent border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-blue-700 transition duration-300"
      >
        Become a Provider
      </button>
    </div>
  </div>

  {/* Right Image */}
  <div className="flex-1 flex justify-center">
    <img
      src="https://intradefairs.com/sites/default/files/news/0Digitalize%20Logistics.jpg"
      alt="Global Logistics"
      className="w-full max-w-lg rounded-2xl shadow-2xl"
    />
  </div>
</section>

      {/* Why Choose RoamEase */}
      <section className="py-16 text-center bg-gray-50">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">
          Why Choose RoamEase?
        </h2>
        <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
          Our platform offers comprehensive features designed to make logistics
          management efficient, secure, and hassle-free.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-6">
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
            <div
              key={index}
              className="bg-white shadow-md rounded-lg p-6 text-left flex items-start gap-4 hover:shadow-xl hover:scale-105 transition duration-300"
            >
              <div className="text-blue-600 text-2xl">{feature.icon}</div>
              <div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 text-center bg-white">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">How It Works</h2>
        <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
          Get started with RoamEase in four simple steps
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-6">
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
            <div
              key={index}
              className="flex flex-col items-center text-center hover:scale-105 transition-transform"
            >
              <div className="bg-yellow-400 text-gray-900 rounded-full p-4 text-3xl mb-4 shadow-lg">
                {step.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Streamline Your Logistics?
          </h2>
          <p className="text-xl mb-8">
            Join thousands of shippers and logistics companies who trust
            RoamEase for their cargo transportation needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate("/signup")}
              className="bg-yellow-400 text-gray-900 font-semibold py-3 px-8 rounded-lg hover:bg-yellow-300 transition duration-300"
            >
              Start Shipping
            </button>
            <button
              onClick={() => navigate("/logistics-signup")}
              className="bg-transparent border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-blue-700 transition duration-300"
            >
              Become a Partner
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
