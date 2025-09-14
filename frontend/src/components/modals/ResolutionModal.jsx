import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const ResolutionModal = ({ isOpen, onClose, onSubmit, reportTitle, loading = false }) => {
  const [resolution, setResolution] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!resolution.trim()) {
      setError('Resolution details are required');
      return;
    }

    if (resolution.trim().length < 10) {
      setError('Resolution details must be at least 10 characters long');
      return;
    }

    setError('');
    onSubmit(resolution.trim());
  };

  const handleClose = () => {
    setResolution('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Resolve Report
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Provide resolution details
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Report Info */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Report Title:
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {reportTitle}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Resolution Details *
              </label>
              <textarea
                id="resolution"
                value={resolution}
                onChange={(e) => {
                  setResolution(e.target.value);
                  setError('');
                }}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white dark:focus:ring-green-400 dark:focus:border-green-400"
                placeholder="Please provide detailed information about how this report was resolved..."
                disabled={loading}
              />
              {error && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Minimum 10 characters required. Be specific about the resolution steps taken.
              </p>
            </div>

            {/* Character Count */}
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <span>
                {resolution.length}/500 characters
              </span>
              <span className={resolution.length > 500 ? 'text-red-500' : ''}>
                {500 - resolution.length} remaining
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !resolution.trim() || resolution.length < 10}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Resolving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Resolve Report
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResolutionModal;
