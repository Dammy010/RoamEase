import React from 'react';
import SignupForm from '../components/forms/SignupForm';

const SignupPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-gray-50">
      <div className="w-full max-w-5xl">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-extrabold text-gray-800 drop-shadow-lg">
            Join RoamEase
          </h2>
          <p className="mt-3 text-gray-600 text-lg">
            Create an account and start your journey with us
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;
