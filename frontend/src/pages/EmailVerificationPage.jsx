import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { verifyEmail } from '../redux/slices/authSlice';

const EmailVerificationPage = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const resultAction = await dispatch(verifyEmail(token));
        if (verifyEmail.fulfilled.match(resultAction)) {
          setStatus('success');
          setMessage('Email verified successfully! Redirecting to login...');
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setStatus('error');
          setMessage(resultAction.payload?.message || 'Verification failed.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('An unexpected error occurred.');
      }
    };

    verify();
  }, [dispatch, token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      {status === 'loading' && (
        <>
          <h2 className="text-xl font-semibold mb-2">Verifying email...</h2>
          <p>Please wait while we confirm your email.</p>
        </>
      )}
      {status === 'success' && (
        <>
          <h2 className="text-xl font-semibold text-green-600 mb-2">{message}</h2>
        </>
      )}
      {status === 'error' && (
        <>
          <h2 className="text-xl font-semibold text-red-600 mb-2">Verification Failed</h2>
          <p>{message}</p>
        </>
      )}
    </div>
  );
};

export default EmailVerificationPage;
