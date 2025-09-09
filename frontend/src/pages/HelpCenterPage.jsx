import React from 'react';

const HelpCenterPage = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-8">Help Center</h1>
        <p className="text-lg text-gray-600 text-center mb-12">
          Welcome to our Help Center. Here you can find answers to frequently asked questions and guides to help you use our platform.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
            <p className="text-gray-700">This section will guide you through the initial setup and basic functionalities.</p>
            <ul className="list-disc list-inside text-gray-600 mt-4 space-y-2">
              <li>How to create an account</li>
              <li>Navigating your dashboard</li>
              <li>Posting your first shipment</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Shipments</h2>
            <p className="text-gray-700">Learn how to manage your shipments from creation to delivery.</p>
            <ul className="list-disc list-inside text-gray-600 mt-4 space-y-2">
              <li>Editing shipment details</li>
              <li>Tracking your cargo</li>
              <li>Resolving shipment issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Account & Billing</h2>
            <p className="text-gray-700">Information regarding your account settings, subscriptions, and payments.</p>
            <ul className="list-disc list-inside text-gray-600 mt-4 space-y-2">
              <li>Updating your profile</li>
              <li>Subscription plans</li>
              <li>Payment methods</li>
            </ul>
          </section>

          <section className="text-center mt-12">
            <p className="text-lg text-gray-700 mb-4">Still need help?</p>
            <a href="/contact" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300">
              Contact Support
            </a>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;


