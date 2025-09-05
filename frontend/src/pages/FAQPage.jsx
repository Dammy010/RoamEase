import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'How do I create an account?',
      answer: 'To create an account, click on the "Sign Up" button in the top right corner of the homepage and follow the instructions.',
    },
    {
      question: 'How do I post a shipment?',
      answer: 'After logging in, navigate to the "Post Shipment" section in your dashboard. Fill out the required details about your cargo, destination, and other specifications.',
    },
    {
      question: 'How do I find logistics providers?',
      answer: 'Once you post a shipment, verified logistics providers will bid on your shipment. You can review their bids and profiles to choose the best one for your needs.',
    },
    {
      question: 'What if I have an issue with my shipment?',
      answer: 'Our platform includes a dispute resolution system. You can also contact our support team directly through the Help Center or by email.',
    },
    {
      question: 'Is my personal information secure?',
      answer: 'Yes, we prioritize the security of your data. Please refer to our Privacy Policy for detailed information on how we collect, use, and protect your personal information.',
    },
    {
      question: 'How does the bidding process work?',
      answer: 'Logistics providers submit bids for your posted shipment. You can view bids, compare prices and services, and accept the bid that best suits your requirements. Once a bid is accepted, the shipment process begins.',
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-8">Frequently Asked Questions</h1>

        <p className="text-lg text-gray-600 text-center mb-12">
          Here are some of the most common questions we receive. If you can't find your answer, please feel free to contact us.
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <button
                className="flex justify-between items-center w-full px-6 py-4 text-left text-lg font-semibold text-gray-800 focus:outline-none focus:bg-gray-100 transition-colors duration-200"
                onClick={() => toggleFAQ(index)}
              >
                {faq.question}
                <ChevronDown
                  className={`h-6 w-6 transform ${openIndex === index ? 'rotate-180' : 'rotate-0'} transition-transform duration-200`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-600 border-t border-gray-200">
                  <p className="mt-2">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Still have questions?</h2>
          <p className="text-lg text-gray-600 mb-8">Our support team is happy to help.</p>
          <a
            href="/contact"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;


