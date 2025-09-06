import React, { createContext, useContext, useEffect, useState } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('currency') || 'USD';
  });

  const [exchangeRates, setExchangeRates] = useState({});

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' }
  ];

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  // Fetch exchange rates (in a real app, this would be from an API)
  useEffect(() => {
    // Mock exchange rates - in production, fetch from a real API
    const mockRates = {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110,
      CAD: 1.25,
      AUD: 1.35,
      CHF: 0.92,
      CNY: 6.45,
      INR: 75,
      BRL: 5.2
    };
    setExchangeRates(mockRates);
  }, []);

  const getCurrentCurrency = () => {
    return currencies.find(c => c.code === currency) || currencies[0];
  };

  const formatCurrency = (amount, targetCurrency = currency) => {
    const currentCurrency = currencies.find(c => c.code === targetCurrency) || currencies[0];
    const rate = exchangeRates[targetCurrency] || 1;
    const convertedAmount = amount * rate;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(convertedAmount);
  };

  const convertCurrency = (amount, fromCurrency, toCurrency) => {
    const fromRate = exchangeRates[fromCurrency] || 1;
    const toRate = exchangeRates[toCurrency] || 1;
    return (amount / fromRate) * toRate;
  };

  const value = {
    currency,
    setCurrency,
    currencies,
    getCurrentCurrency,
    formatCurrency,
    convertCurrency,
    exchangeRates
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
