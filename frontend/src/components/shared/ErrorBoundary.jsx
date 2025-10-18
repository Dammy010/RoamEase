import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console with more details
    console.error("🚨 ErrorBoundary caught an error:", error);
    console.error("📋 Error Info:", errorInfo);
    console.error("🔍 Component Stack:", errorInfo.componentStack);
    console.error("🌐 Current URL:", window.location.href);
    console.error("📱 User Agent:", navigator.userAgent);
    console.error("💾 Local Storage:", {
      token: !!localStorage.getItem("token"),
      user: !!localStorage.getItem("user"),
      refreshToken: !!localStorage.getItem("refreshToken"),
    });

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    // Clear any problematic localStorage data
    try {
      localStorage.removeItem("socket");
      localStorage.removeItem("socketConnected");
    } catch (e) {
      console.log("Could not clear socket data:", e);
    }

    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI with detailed error information
      return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Oops! Something went wrong
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We encountered an unexpected error. This might be a temporary
              issue.
            </p>

            {/* Show actual error details on screen for debugging */}
            {this.state.error && (
              <div className="mb-6 text-left bg-red-50 dark:bg-red-900 p-4 rounded-lg">
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  🚨 Error Details:
                </h3>
                <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
                  <div>
                    <strong>Error:</strong> {this.state.error.toString()}
                  </div>
                  {this.state.error.message && (
                    <div>
                      <strong>Message:</strong> {this.state.error.message}
                    </div>
                  )}
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="text-xs mt-1 overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  <div>
                    <strong>URL:</strong> {window.location.href}
                  </div>
                  <div>
                    <strong>User Agent:</strong> {navigator.userAgent}
                  </div>
                  <div>
                    <strong>Local Storage:</strong>{" "}
                    {localStorage.getItem("token")
                      ? "Token exists"
                      : "No token"}
                  </div>
                </div>
              </div>
            )}

            {/* Mobile-specific help */}
            {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
              navigator.userAgent
            ) && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  📱 Mobile User Tips:
                </h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Try refreshing the page</li>
                  <li>• Clear your browser cache</li>
                  <li>• Make sure you have a stable internet connection</li>
                  <li>• Try using a different browser</li>
                </ul>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Home
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-500 mt-6">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    // If there's no error, render the children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
