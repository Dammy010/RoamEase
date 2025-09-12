import React from "react";
import { Truck, Ship, Plane, Warehouse, MapPin, Package } from "lucide-react";

const services = [
  {
    icon: <Truck className="w-8 h-8 text-blue-600" />,
    title: "Trucking",
    description: "Reliable long-haul and local road transport solutions for all shipment sizes.",
  },
  {
    icon: <Ship className="w-8 h-8 text-blue-600" />,
    title: "Shipping",
    description: "International and domestic sea freight with door-to-port or door-to-door options.",
  },
  {
    icon: <Plane className="w-8 h-8 text-blue-600" />,
    title: "Air Freight",
    description: "Fast, secure air cargo transport for urgent and high-value shipments.",
  },
  {
    icon: <Warehouse className="w-8 h-8 text-blue-600" />,
    title: "Warehousing",
    description: "Secure storage facilities with inventory management and distribution services.",
  },
  {
    icon: <MapPin className="w-8 h-8 text-blue-600" />,
    title: "Last-Mile Delivery",
    description: "Efficient delivery to final destinations with tracking and proof of delivery.",
  },
  {
    icon: <Package className="w-8 h-8 text-blue-600" />,
    title: "Logistics Planning",
    description: "Tailored supply chain strategies to optimize cost and delivery time.",
  },
];

const ServicesPage = () => {
  return (
    <div className="bg-gradient-to-b from-white to-blue-50">

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Our Logistics Services
        </h1>
        <p className="text-base text-gray-600 max-w-2xl mx-auto">
          At RoamEase, we connect shippers and logistics providers with reliable, secure, and fast transport services worldwide.
        </p>
      </section>

      {/* Services Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 text-center border border-gray-100"
            >
              <div className="flex justify-center mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {service.title}
              </h3>
              <p className="text-gray-600 text-sm">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Ship Smarter?</h2>
        <p className="mb-6">
          Join thousands of businesses already streamlining their logistics with RoamEase.
        </p>
        <a
          href="/signup"
          className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Get Started
        </a>
      </section>
    </div>
  );
};

export default ServicesPage;
