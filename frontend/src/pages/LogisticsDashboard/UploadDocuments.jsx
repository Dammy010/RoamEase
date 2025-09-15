import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'react-toastify';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const UploadDocuments = () => {
  const { user } = useSelector((state) => state.auth);
  const { isDark } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState({
    businessLicense: null,
    insuranceCertificate: null,
    governmentId: null,
    taxCertificate: null,
    financialStatement: null
  });

  const [uploadStatus, setUploadStatus] = useState({
    businessLicense: 'pending',
    insuranceCertificate: 'pending',
    governmentId: 'pending',
    taxCertificate: 'pending',
    financialStatement: 'pending'
  });

  const handleFileChange = (e, documentType) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload PDF, JPEG, or PNG files only');
        return;
      }

      setDocuments(prev => ({ ...prev, [documentType]: file }));
      setUploadStatus(prev => ({ ...prev, [documentType]: 'uploading' }));
      
      // Simulate upload process
      setTimeout(() => {
        setUploadStatus(prev => ({ ...prev, [documentType]: 'uploaded' }));
        toast.success(`${documentType.replace(/([A-Z])/g, ' $1').trim()} uploaded successfully!`);
      }, 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      // TODO: Implement actual file upload to backend
      const formData = new FormData();
      Object.entries(documents).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success('Documents submitted successfully! Your application will be reviewed within 24-48 hours.');
      
      // Reset form
      setDocuments({
        businessLicense: null,
        insuranceCertificate: null,
        governmentId: null,
        taxCertificate: null,
        financialStatement: null
      });
      
    } catch (error) {
      toast.error('Failed to submit documents. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploaded':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'uploading':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'uploaded':
        return 'Uploaded';
      case 'uploading':
        return 'Uploading...';
      case 'pending':
        return 'Pending';
      default:
        return 'Pending';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'uploaded':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'uploading':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending':
        return 'text-gray-600 bg-gray-50 border-gray-200 dark:border-gray-700';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="p-6 min-h-screen bg-white dark:bg-gray-900">      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <Upload className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">📋 Document Verification</h2>
          </div>
          
          <p className="text-gray-600 mb-8">
            Please upload the required documents to complete your logistics provider verification. 
            All documents will be reviewed by our team within 24-48 hours.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Required Documents */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Required Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'businessLicense', label: 'Business License', required: true },
                  { key: 'insuranceCertificate', label: 'Insurance Certificate', required: true },
                  { key: 'governmentId', label: 'Government ID', required: true }
                ].map(({ key, label, required }) => (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {label} {required && <span className="text-red-500">*</span>}
                    </label>
                    <div className={`p-4 border-2 border-dashed rounded-lg ${getStatusColor(uploadStatus[key])}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(uploadStatus[key])}
                          <span className="text-sm font-medium">{getStatusText(uploadStatus[key])}</span>
                        </div>
                        {documents[key] && (
                          <span className="text-xs text-gray-500">{documents[key].name}</span>
                        )}
                      </div>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, key)}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="mt-2 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        required={required}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Documents */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Optional Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'taxCertificate', label: 'Tax Certificate' },
                  { key: 'financialStatement', label: 'Financial Statement' }
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">{label}</label>
                    <div className={`p-4 border-2 border-dashed rounded-lg ${getStatusColor(uploadStatus[key])}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(uploadStatus[key])}
                          <span className="text-sm font-medium">{getStatusText(uploadStatus[key])}</span>
                        </div>
                        {documents[key] && (
                          <span className="text-xs text-gray-500">{documents[key].name}</span>
                        )}
                      </div>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, key)}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="mt-2 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* File Requirements */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">📋 File Requirements</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Maximum file size: 5MB per document</li>
                <li>• Accepted formats: PDF, JPEG, PNG</li>
                <li>• Ensure documents are clear and legible</li>
                <li>• All required documents must be uploaded</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploading || Object.values(uploadStatus).some(status => status === 'pending')}
                className={`px-8 py-3 rounded-lg font-semibold transition ${
                  uploading || Object.values(uploadStatus).some(status => status === 'pending')
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {uploading ? 'Submitting...' : 'Submit Documents'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadDocuments;