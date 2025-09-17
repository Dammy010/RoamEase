import React, { createContext, useContext, useEffect, useState } from "react";

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem("currency") || "USD";
  });

  const [exchangeRates, setExchangeRates] = useState({});

  const currencies = [
    {
      code: "USD",
      name: "US Dollar",
      symbol: "$",
      flag: "🇺🇸",
      locale: "en-US",
    },
    { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", locale: "de-DE" },
    {
      code: "GBP",
      name: "British Pound",
      symbol: "£",
      flag: "🇬🇧",
      locale: "en-GB",
    },
    {
      code: "NGN",
      name: "Nigerian Naira",
      symbol: "₦",
      flag: "🇳🇬",
      locale: "en-NG",
    },
    {
      code: "JPY",
      name: "Japanese Yen",
      symbol: "¥",
      flag: "🇯🇵",
      locale: "ja-JP",
    },
    {
      code: "CAD",
      name: "Canadian Dollar",
      symbol: "C$",
      flag: "🇨🇦",
      locale: "en-CA",
    },
    {
      code: "AUD",
      name: "Australian Dollar",
      symbol: "A$",
      flag: "🇦🇺",
      locale: "en-AU",
    },
    {
      code: "CHF",
      name: "Swiss Franc",
      symbol: "CHF",
      flag: "🇨🇭",
      locale: "de-CH",
    },
    {
      code: "CNY",
      name: "Chinese Yuan",
      symbol: "¥",
      flag: "🇨🇳",
      locale: "zh-CN",
    },
    {
      code: "INR",
      name: "Indian Rupee",
      symbol: "₹",
      flag: "🇮🇳",
      locale: "en-IN",
    },
    {
      code: "BRL",
      name: "Brazilian Real",
      symbol: "R$",
      flag: "🇧🇷",
      locale: "pt-BR",
    },
    {
      code: "MXN",
      name: "Mexican Peso",
      symbol: "$",
      flag: "🇲🇽",
      locale: "es-MX",
    },
    {
      code: "ZAR",
      name: "South African Rand",
      symbol: "R",
      flag: "🇿🇦",
      locale: "en-ZA",
    },
    {
      code: "AED",
      name: "UAE Dirham",
      symbol: "د.إ",
      flag: "🇦🇪",
      locale: "ar-AE",
    },
    {
      code: "SGD",
      name: "Singapore Dollar",
      symbol: "S$",
      flag: "🇸🇬",
      locale: "en-SG",
    },
  ];

  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  // Fetch exchange rates from API
  useEffect(() => {
    // TODO: Replace with real exchange rate API
    const defaultRates = {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      NGN: 460,
      JPY: 110,
      CAD: 1.25,
      AUD: 1.35,
      CHF: 0.92,
      CNY: 6.45,
      INR: 75,
      BRL: 5.2,
      MXN: 18.5,
      ZAR: 15.2,
      AED: 3.67,
      SGD: 1.35,
    };
    setExchangeRates(defaultRates);
  }, []);

  const getCurrentCurrency = () => {
    return currencies.find((c) => c.code === currency) || currencies[0];
  };

  const getCurrencySymbol = (targetCurrency = currency) => {
    const currentCurrency =
      currencies.find((c) => c.code === targetCurrency) || currencies[0];
    return currentCurrency.symbol;
  };

  const formatCurrency = (
    amount,
    fromCurrency = "USD",
    targetCurrency = currency,
    options = {}
  ) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return getCurrencySymbol(targetCurrency) + "0.00";
    }

    const currentCurrency =
      currencies.find((c) => c.code === targetCurrency) || currencies[0];

    // Convert amount from fromCurrency to targetCurrency
    let convertedAmount = amount;

    // If the currencies are different, convert the amount
    if (fromCurrency !== targetCurrency) {
      const fromRate = exchangeRates[fromCurrency] || 1;
      const toRate = exchangeRates[targetCurrency] || 1;

      // Convert: amount (in fromCurrency) -> USD -> targetCurrency
      const amountInUSD = amount / fromRate;
      convertedAmount = amountInUSD * toRate;
    }

    const {
      showSymbol = true,
      minimumFractionDigits = 2,
      maximumFractionDigits = 2,
      compact = false,
    } = options;

    if (compact && convertedAmount >= 1000) {
      return new Intl.NumberFormat(currentCurrency.locale, {
        style: "currency",
        currency: targetCurrency,
        notation: "compact",
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }).format(convertedAmount);
    }

    // Use a simpler approach for currency formatting
    const symbol = getCurrencySymbol(targetCurrency);
    const formattedNumber = convertedAmount.toLocaleString(
      currentCurrency.locale,
      {
        minimumFractionDigits,
        maximumFractionDigits,
      }
    );

    const formatted = showSymbol
      ? `${symbol}${formattedNumber}`
      : formattedNumber;

    return formatted;
  };

  const formatCurrencySimple = (
    amount,
    fromCurrency = "USD",
    targetCurrency = currency
  ) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return getCurrencySymbol(targetCurrency) + "0.00";
    }

    const currentCurrency =
      currencies.find((c) => c.code === targetCurrency) || currencies[0];

    // Convert amount from fromCurrency to targetCurrency
    let convertedAmount = amount;

    // If the currencies are different, convert the amount
    if (fromCurrency !== targetCurrency) {
      const fromRate = exchangeRates[fromCurrency] || 1;
      const toRate = exchangeRates[targetCurrency] || 1;

      // Convert: amount (in fromCurrency) -> USD -> targetCurrency
      const amountInUSD = amount / fromRate;
      convertedAmount = amountInUSD * toRate;
    }

    return getCurrencySymbol(targetCurrency) + convertedAmount.toFixed(2);
  };

  const convertCurrency = (amount, fromCurrency, toCurrency) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return 0;
    }
    const fromRate = exchangeRates[fromCurrency] || 1;
    const toRate = exchangeRates[toCurrency] || 1;
    return (amount / fromRate) * toRate;
  };

  const parseCurrency = (value, targetCurrency = currency) => {
    if (!value || typeof value !== "string") return 0;

    // Remove currency symbols and non-numeric characters except decimal point
    const cleanValue = value.replace(/[^\d.,]/g, "");
    const numericValue = parseFloat(cleanValue.replace(",", "."));

    if (isNaN(numericValue)) return 0;

    // Convert back to base currency (USD) for storage
    const rate = exchangeRates[targetCurrency] || 1;
    return numericValue / rate;
  };

  const value = {
    currency,
    setCurrency,
    currencies,
    getCurrentCurrency,
    getCurrencySymbol,
    formatCurrency,
    formatCurrencySimple,
    convertCurrency,
    parseCurrency,
    exchangeRates,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
