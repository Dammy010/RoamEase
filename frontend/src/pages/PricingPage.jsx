const PricingPage = () => {
  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">Our Pricing Plans</h1>

        <p className="text-base text-gray-600 text-center mb-8">
          Choose the plan that best fits your needs. All plans come with essential features to streamline your logistics.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Basic Plan */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Basic</h2>
              <p className="text-sm text-gray-500">Ideal for small businesses and occasional shippers.</p>
              <p className="mt-6 flex items-baseline">
                <span className="text-4xl font-extrabold text-gray-900">$29</span>
                <span className="ml-1 text-lg font-medium text-gray-500">/month</span>
              </p>
              <ul className="mt-6 space-y-4 text-gray-600">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>Up to 10 shipments per month</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>Standard tracking</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>Email support</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-50 p-6">
              <button className="mt-6 block w-full py-2 px-4 border border-transparent rounded-md text-center text-white bg-blue-600 hover:bg-blue-700 font-medium transition-colors duration-300 text-sm">
                Choose Basic
              </button>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-blue-500 transform hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Pro</h2>
              <p className="text-sm text-gray-500">Perfect for growing businesses with moderate shipping needs.</p>
              <p className="mt-6 flex items-baseline">
                <span className="text-4xl font-extrabold text-gray-900">$79</span>
                <span className="ml-1 text-lg font-medium text-gray-500">/month</span>
              </p>
              <ul className="mt-6 space-y-4 text-gray-600">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>Up to 50 shipments per month</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>Advanced real-time tracking</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>Priority email support</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>Customizable reports</span>
                </li>
              </ul>
            </div>
            <div className="bg-blue-50 p-6">
              <button className="mt-6 block w-full py-2 px-4 border border-transparent rounded-md text-center text-white bg-blue-600 hover:bg-blue-700 font-medium transition-colors duration-300 text-sm">
                Choose Pro
              </button>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Enterprise</h2>
              <p className="text-sm text-gray-500">For large-scale operations requiring comprehensive solutions.</p>
              <p className="mt-6 flex items-baseline">
                <span className="text-4xl font-extrabold text-gray-900">$199</span>
                <span className="ml-1 text-lg font-medium text-gray-500">/month</span>
              </p>
              <ul className="mt-6 space-y-4 text-gray-600">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>Unlimited shipments</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>24/7 Phone & chat support</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>API access & custom integrations</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-50 p-6">
              <button className="mt-6 block w-full py-2 px-4 border border-transparent rounded-md text-center text-white bg-blue-600 hover:bg-blue-700 font-medium transition-colors duration-300 text-sm">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;


