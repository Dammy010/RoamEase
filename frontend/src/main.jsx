import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/drawer.css";
import "leaflet/dist/leaflet.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";

// Mobile-specific error handling
const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

// Safe Notification API polyfill for mobile
if (typeof Notification === "undefined") {
  window.Notification = {
    permission: "denied",
    requestPermission: () => Promise.resolve("denied"),
    constructor: function () {
      throw new Error("Notification API not supported");
    },
  };
}

// Safe localStorage wrapper for mobile
const safeLocalStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get localStorage item ${key}:`, error);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to set localStorage item ${key}:`, error);
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove localStorage item ${key}:`, error);
    }
  },
};

// Make store available globally for API interceptor
window.store = store;

// Mobile-specific initialization
if (isMobile) {
  // Add mobile-specific error handling
  window.addEventListener("error", (event) => {
    console.error("Mobile Error:", event.error);

    // Show error on screen for mobile debugging
    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #dc2626;
      color: white;
      padding: 10px;
      font-family: Arial, sans-serif;
      font-size: 12px;
      z-index: 9999;
      max-height: 200px;
      overflow-y: auto;
    `;
    errorDiv.innerHTML = `
      <strong>🚨 Mobile Error:</strong><br>
      ${event.error?.message || event.message || "Unknown error"}<br>
      <strong>File:</strong> ${event.filename || "Unknown"}<br>
      <strong>Line:</strong> ${event.lineno || "Unknown"}<br>
      <button onclick="this.parentElement.remove()" style="background: white; color: #dc2626; border: none; padding: 5px 10px; margin-top: 5px; border-radius: 3px; cursor: pointer;">Close</button>
    `;
    document.body.appendChild(errorDiv);
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("Mobile Unhandled Promise Rejection:", event.reason);

    // Show promise rejection on screen for mobile debugging
    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #dc2626;
      color: white;
      padding: 10px;
      font-family: Arial, sans-serif;
      font-size: 12px;
      z-index: 9999;
      max-height: 200px;
      overflow-y: auto;
    `;
    errorDiv.innerHTML = `
      <strong>🚨 Mobile Promise Rejection:</strong><br>
      ${event.reason?.message || event.reason || "Unknown rejection"}<br>
      <button onclick="this.parentElement.remove()" style="background: white; color: #dc2626; border: none; padding: 5px 10px; margin-top: 5px; border-radius: 3px; cursor: pointer;">Close</button>
    `;
    document.body.appendChild(errorDiv);
  });
}

// Add loading indicator for mobile debugging
if (isMobile) {
  const loadingDiv = document.createElement("div");
  loadingDiv.id = "mobile-loading";
  loadingDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #3b82f6;
    color: white;
    padding: 10px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    z-index: 9998;
    text-align: center;
  `;
  loadingDiv.innerHTML = "🚀 Loading RoamEase...";
  document.body.appendChild(loadingDiv);
}

// Safe render with error boundary
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <ThemeProvider>
          <CurrencyProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </CurrencyProvider>
        </ThemeProvider>
      </Provider>
    </React.StrictMode>
  );

  // Remove loading indicator after successful render
  setTimeout(() => {
    const loadingDiv = document.getElementById("mobile-loading");
    if (loadingDiv) {
      loadingDiv.remove();
    }
  }, 2000);
} catch (error) {
  console.error("Failed to render React app:", error);

  // Remove loading indicator
  const loadingDiv = document.getElementById("mobile-loading");
  if (loadingDiv) {
    loadingDiv.remove();
  }

  // Fallback error display with detailed error info
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h1 style="color: #dc2626; margin-bottom: 20px;">🚨 App Loading Error</h1>
        
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: left;">
          <h3 style="color: #dc2626; margin: 0 0 10px 0;">Error Details:</h3>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Error:</strong> ${
            error.message || "Unknown error"
          }</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>URL:</strong> ${
            window.location.href
          }</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>User Agent:</strong> ${
            navigator.userAgent
          }</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Local Storage:</strong> ${
            localStorage.getItem("token") ? "Token exists" : "No token"
          }</p>
        </div>
        
        <p style="margin-bottom: 20px;">Please refresh the page or try again later.</p>
        
        <button onclick="window.location.reload()" style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; margin-right: 10px;">
          🔄 Refresh Page
        </button>
        
        <button onclick="window.location.href='/'" style="padding: 12px 24px; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
          🏠 Go Home
        </button>
      </div>
    `;
  }
}
