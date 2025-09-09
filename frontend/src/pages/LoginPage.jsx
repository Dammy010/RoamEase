import React from 'react';
import LoginForm from '../components/forms/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-5xl">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
