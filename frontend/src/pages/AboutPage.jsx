import React from 'react';
import Footer from '../components/shared/Footer';
import { 
  Truck, Package, Globe, Shield, Users, Award, Star, 
  CheckCircle, ArrowRight, Heart, Target, Zap
} from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="flex flex-col min-h-screen">

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-3xl font-bold mb-4">About RoamEase</h1>
          <p className="text-base max-w-3xl mx-auto">
            Connecting cargo owners with trusted logistics partners for seamless delivery across Nigeria.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Image */}
          <div className="rounded-lg overflow-hidden shadow-lg">
            <img
              src="https://amertranslogistics.com/wp-content/uploads/2022/06/Transport-logistics.jpg"
              alt="Logistics"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Side - Text */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Who We Are</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              RoamEase is a logistics coordination platform designed to streamline shipment delivery across Nigeria. 
              We connect cargo owners with licensed logistics partners, enabling seamless communication, bidding, 
              and real-time delivery tracking.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Whether you're an individual sending packages or a business managing bulk freight services, RoamEase 
              helps you find trusted partners, negotiate competitive rates, and manage all your shipments in one 
              easy-to-use platform.
            </p>
          </div>
        </div>
      </main>

      {/* Values Section */}
      <section className="bg-white py-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Our Core Values</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="bg-gray-100 p-6 rounded-lg shadow hover:shadow-md transition">
              <h3 className="text-xl font-semibold text-blue-700 mb-2">Trust</h3>
              <p className="text-gray-600">We partner only with verified logistics companies to ensure your goods are safe.</p>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg shadow hover:shadow-md transition">
              <h3 className="text-xl font-semibold text-blue-700 mb-2">Efficiency</h3>
              <p className="text-gray-600">We streamline communication and tracking to save you time and money.</p>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg shadow hover:shadow-md transition">
              <h3 className="text-xl font-semibold text-blue-700 mb-2">Transparency</h3>
              <p className="text-gray-600">Clear pricing, real-time updates, and honest communication at every step.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
