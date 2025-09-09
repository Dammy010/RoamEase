import React from 'react';
import SignupForm from '../components/forms/SignupForm';

const SignupPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-5xl">
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;
