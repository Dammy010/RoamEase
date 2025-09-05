import React from 'react';
import LoginForm from '../components/forms/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-gray-50">
      <div className="w-full max-w-5xl">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-extrabold text-gray-800 drop-shadow-lg">
            Welcome Back
          </h2>
          <p className="mt-3 text-gray-600 text-lg">
            Login to your RoamEase account
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
