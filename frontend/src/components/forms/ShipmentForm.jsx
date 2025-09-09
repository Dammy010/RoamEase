import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { postShipment } from "../../redux/slices/shipmentSlice";
import { 
  Package, MapPin, Calendar, Truck, Weight, Ruler, 
  Upload, FileText, Image, CheckCircle, ArrowRight, 
  ArrowLeft, Shield, AlertCircle, Clock, Globe,
  User, Phone, Mail, Info, Star
} from 'lucide-react';

const SectionHeader = ({ title, icon: Icon, description }) => (
  <div className="mb-8">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
        <Icon className="text-white" size={20} />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{title}</h2>
    </div>
    {description && (
      <p className="text-gray-600 text-lg">{description}</p>
    )}
  </div>
);

const Input = ({ label, id, required, icon: Icon, ...props }) => (
  <div className="mb-6">
    {label && (
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-gray-700 mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      )}
      <input
        id={id}
        {...props}
        className={`w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 ${
          Icon ? 'pl-10' : ''
        } hover:border-gray-400`}
      />
    </div>
  </div>
);

const TextArea = ({ label, id, required, icon: Icon, ...props }) => (
  <div className="mb-6">
    {label && (
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-gray-700 mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute top-3 left-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      )}
      <textarea
        id={id}
        {...props}
        className={`w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 resize-none ${
          Icon ? 'pl-10' : ''
        } hover:border-gray-400`}
      />
    </div>
  </div>
);

const Select = ({ label, id, options, required, icon: Icon, ...props }) => (
  <div className="mb-6">
    {label && (
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-gray-700 mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      )}
      <select
        id={id}
        {...props}
        className={`w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 ${
          Icon ? 'pl-10' : ''
        } hover:border-gray-400`}
      >
        <option value="">Select {label?.toLowerCase()}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const RadioGroup = ({ label, name, options, value, onChange, required, icon: Icon }) => (
  <div className="mb-6">
    {label && (
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {options.map((option) => (
        <label
          key={option}
          className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
            value === option
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={onChange}
            className="sr-only"
          />
          <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
            value === option
              ? 'border-indigo-500 bg-indigo-500'
              : 'border-gray-300'
          }`}>
            {value === option && (
              <div className="w-2 h-2 rounded-full bg-white dark:bg-gray-800"></div>
            )}
          </div>
          <span className="font-medium text-gray-700">{option}</span>
        </label>
      ))}
    </div>
  </div>
);

const FileUpload = ({ label, accept, multiple, onChange, files, type = "photos" }) => (
  <div className="mb-6">
    <label className="block text-sm font-semibold text-gray-700 mb-3">
      {label}
    </label>
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors duration-200">
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onChange}
        className="hidden"
        id={`file-upload-${type}`}
      />
      <label
        htmlFor={`file-upload-${type}`}
        className="cursor-pointer flex flex-col items-center"
      >
        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-3">
          {type === "photos" ? (
            <Image className="text-indigo-600" size={24} />
          ) : (
            <FileText className="text-indigo-600" size={24} />
          )}
        </div>
        <p className="text-gray-600 font-medium">
          Click to upload {type === "photos" ? "photos" : "documents"}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {type === "photos" ? "PNG, JPG, JPEG up to 10MB" : "PDF, DOC, DOCX up to 10MB"}
        </p>
      </label>
    </div>
    {files.length > 0 && (
      <div className="mt-4">
        {type === "photos" ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {files.map((file, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={file.preview}
                  alt="preview"
                  className="w-full h-24 object-cover rounded-xl shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newFiles = files.filter((_, i) => i !== idx);
                    // This would need to be handled by parent component
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <FileText className="text-gray-500" size={20} />
                  <span className="text-sm font-medium text-gray-700">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newFiles = files.filter((_, i) => i !== idx);
                    // This would need to be handled by parent component
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )}
  </div>
);

const Checkbox = ({ label, name, checked, onChange, required }) => (
  <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-300 transition-colors duration-200 cursor-pointer">
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-0.5"
      required={required}
    />
    <div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {required && <span className="text-red-500 ml-1">*</span>}
    </div>
  </label>
);

const ShipmentForm = () => {
  const [formData, setFormData] = useState({
    shipmentTitle: "",
    descriptionOfGoods: "",
    typeOfGoods: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    quantity: "1",
    pickupAddress: "",
    pickupCity: "",
    pickupCountry: "",
    preferredPickupDate: "",
    pickupContactPerson: "",
    pickupPhoneNumber: "",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryCountry: "",
    preferredDeliveryDate: "",
    deliveryContactPerson: "",
    deliveryPhoneNumber: "",
    modeOfTransport: "",
    insuranceRequired: "",
    handlingInstructions: "",
    photos: [],
    documents: [],
    confirmDetails: false,
    agreeToPolicy: false,
  });

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const dispatch = useDispatch();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleCheckboxChange = useCallback((e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  }, []);

  const handleFileChange = useCallback((e, field) => {
    const files = Array.from(e.target.files).map((file) => {
      if (field === "photos") file.preview = URL.createObjectURL(file);
      return file;
    });
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ...files] }));
  }, []);

  const removeFile = useCallback((field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!formData.confirmDetails || !formData.agreeToPolicy) return;

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (
          ["photos", "documents", "confirmDetails", "agreeToPolicy"].includes(
            key
          )
        )
          return;
        if (value !== undefined && value !== null) data.append(key, value);
      });
      formData.photos.forEach((file) => data.append("photos", file));
      formData.documents.forEach((file) => data.append("documents", file));

      setLoading(true);
      dispatch(postShipment(data)).finally(() => setLoading(false));
    },
    [dispatch, formData]
  );

  useEffect(() => {
    return () => {
      formData.photos.forEach(
        (file) => file.preview && URL.revokeObjectURL(file.preview)
      );
    };
  }, [formData.photos]);

  // Step content
  const steps = [
    {
      title: "Shipment Details",
      icon: Package,
      description: "Tell us about your shipment",
      content: (
        <div className="space-y-6">
          <Input
            label="Shipment Title"
            id="shipmentTitle"
            name="shipmentTitle"
            value={formData.shipmentTitle}
            onChange={handleChange}
            placeholder="Brief, descriptive title for your shipment"
            icon={Package}
            required
          />
          <TextArea
            label="Description of Goods"
            id="descriptionOfGoods"
            name="descriptionOfGoods"
            value={formData.descriptionOfGoods}
            onChange={handleChange}
            rows={4}
            placeholder="Provide detailed description of the goods being shipped"
            icon={Info}
            required
          />
        </div>
      ),
    },
    {
      title: "Goods Specifications",
      icon: Weight,
      description: "Specify the physical properties of your goods",
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Select
              label="Type of Goods"
              id="typeOfGoods"
              name="typeOfGoods"
              value={formData.typeOfGoods}
              onChange={handleChange}
              options={[
                "Electronics",
                "Furniture",
                "Clothing",
                "Food & Beverages",
                "Machinery & Equipment",
                "Documents",
                "Art & Antiques",
                "Automotive Parts",
                "Medical Supplies",
                "Other",
              ]}
              icon={Package}
              required
            />
            <Input
              label="Weight (kg)"
              id="weight"
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleChange}
              placeholder="Enter weight in kilograms"
              icon={Weight}
              min="0.1"
              step="0.1"
              required
            />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Input
              label="Length (cm)"
              id="length"
              name="length"
              type="number"
              value={formData.length}
              onChange={handleChange}
              placeholder="Length"
              icon={Ruler}
              min="1"
            />
            <Input
              label="Width (cm)"
              id="width"
              name="width"
              type="number"
              value={formData.width}
              onChange={handleChange}
              placeholder="Width"
              icon={Ruler}
              min="1"
            />
            <Input
              label="Height (cm)"
              id="height"
              name="height"
              type="number"
              value={formData.height}
              onChange={handleChange}
              placeholder="Height"
              icon={Ruler}
              min="1"
            />
          </div>
          <Input
            label="Quantity"
            id="quantity"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Number of items"
            icon={Package}
            min="1"
            required
          />
        </div>
      ),
    },
    {
      title: "Pickup Details",
      icon: MapPin,
      description: "Where should we collect your shipment?",
      content: (
        <div className="space-y-6">
          <TextArea
            label="Pickup Address"
            id="pickupAddress"
            name="pickupAddress"
            value={formData.pickupAddress}
            onChange={handleChange}
            rows={3}
            placeholder="Complete address including street, building, etc."
            icon={MapPin}
            required
          />
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="City"
              id="pickupCity"
              name="pickupCity"
              value={formData.pickupCity}
              onChange={handleChange}
              placeholder="Pickup city"
              icon={Globe}
              required
            />
            <Input
              label="Country"
              id="pickupCountry"
              name="pickupCountry"
              value={formData.pickupCountry}
              onChange={handleChange}
              placeholder="Pickup country"
              icon={Globe}
              required
            />
          </div>
          <Input
            label="Preferred Pickup Date"
            id="preferredPickupDate"
            name="preferredPickupDate"
            type="date"
            value={formData.preferredPickupDate}
            onChange={handleChange}
            icon={Calendar}
            required
          />
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Contact Person"
              id="pickupContactPerson"
              name="pickupContactPerson"
              value={formData.pickupContactPerson}
              onChange={handleChange}
              placeholder="Full name"
              icon={User}
              required
            />
            <Input
              label="Phone Number"
              id="pickupPhoneNumber"
              name="pickupPhoneNumber"
              type="tel"
              value={formData.pickupPhoneNumber}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              icon={Phone}
              required
            />
          </div>
        </div>
      ),
    },
    {
      title: "Delivery Details",
      icon: MapPin,
      description: "Where should we deliver your shipment?",
      content: (
        <div className="space-y-6">
          <TextArea
            label="Delivery Address"
            id="deliveryAddress"
            name="deliveryAddress"
            value={formData.deliveryAddress}
            onChange={handleChange}
            rows={3}
            placeholder="Complete address including street, building, etc."
            icon={MapPin}
            required
          />
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="City"
              id="deliveryCity"
              name="deliveryCity"
              value={formData.deliveryCity}
              onChange={handleChange}
              placeholder="Delivery city"
              icon={Globe}
              required
            />
            <Input
              label="Country"
              id="deliveryCountry"
              name="deliveryCountry"
              value={formData.deliveryCountry}
              onChange={handleChange}
              placeholder="Delivery country"
              icon={Globe}
              required
            />
          </div>
          <Input
            label="Preferred Delivery Date"
            id="preferredDeliveryDate"
            name="preferredDeliveryDate"
            type="date"
            value={formData.preferredDeliveryDate}
            onChange={handleChange}
            icon={Calendar}
            required
          />
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Contact Person"
              id="deliveryContactPerson"
              name="deliveryContactPerson"
              value={formData.deliveryContactPerson}
              onChange={handleChange}
              placeholder="Full name"
              icon={User}
              required
            />
            <Input
              label="Phone Number"
              id="deliveryPhoneNumber"
              name="deliveryPhoneNumber"
              type="tel"
              value={formData.deliveryPhoneNumber}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              icon={Phone}
              required
            />
          </div>
        </div>
      ),
    },
    {
      title: "Transport & Handling",
      icon: Truck,
      description: "How should your shipment be transported?",
      content: (
        <div className="space-y-6">
          <RadioGroup
            label="Mode of Transport"
            name="modeOfTransport"
            value={formData.modeOfTransport}
            onChange={handleChange}
            options={["Road", "Air", "Sea", "Rail", "Express"]}
            required
          />
          <RadioGroup
            label="Insurance Required"
            name="insuranceRequired"
            value={formData.insuranceRequired}
            onChange={handleChange}
            options={["Yes", "No"]}
            required
          />
          <TextArea
            label="Handling Instructions"
            id="handlingInstructions"
            name="handlingInstructions"
            value={formData.handlingInstructions}
            onChange={handleChange}
            rows={3}
            placeholder="Special handling requirements (e.g., Fragile, Keep upright, Temperature controlled)"
            icon={AlertCircle}
          />
        </div>
      ),
    },
    {
      title: "Attachments",
      icon: Upload,
      description: "Add photos and documents to help logistics providers",
      content: (
        <div className="space-y-8">
          <FileUpload
            label="Upload Photos"
            accept="image/*"
            multiple
            onChange={(e) => handleFileChange(e, "photos")}
            files={formData.photos}
            type="photos"
          />
          <FileUpload
            label="Upload Documents"
            accept=".pdf,.doc,.docx"
            multiple
            onChange={(e) => handleFileChange(e, "documents")}
            files={formData.documents}
            type="documents"
          />
        </div>
      ),
    },
    {
      title: "Confirmation",
      icon: CheckCircle,
      description: "Review and confirm your shipment details",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-200">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Shield className="text-indigo-600" size={20} />
              Terms & Conditions
            </h3>
            <div className="space-y-4">
              <Checkbox
                label="I confirm that all shipment details provided are accurate and complete"
                name="confirmDetails"
                checked={formData.confirmDetails}
                onChange={handleCheckboxChange}
                required
              />
              <Checkbox
                label="I agree to RoamEase's Terms of Service and Privacy Policy"
                name="agreeToPolicy"
                checked={formData.agreeToPolicy}
                onChange={handleCheckboxChange}
                required
              />
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Package className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">Post a Shipment</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with verified logistics providers worldwide and get competitive quotes for your shipment
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">
              Step {step + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(((step + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Step Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white dark:bg-gray-800/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                {React.createElement(steps[step].icon, { className: "text-white text-2xl" })}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{steps[step].title}</h2>
                <p className="text-indigo-100 text-lg">{steps[step].description}</p>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="p-8">
            {steps[step].content}
          </div>

          {/* Navigation */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold"
                >
                  <ArrowLeft size={20} />
                  Back
                </button>
              ) : (
                <div></div>
              )}
              
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Continue
                  <ArrowRight size={20} />
                </button>
              ) : (
                <button
                  type="submit"
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 ${
                    loading || !formData.confirmDetails || !formData.agreeToPolicy
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-xl transform hover:-translate-y-0.5"
                  }`}
                  disabled={loading || !formData.confirmDetails || !formData.agreeToPolicy}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Posting Shipment...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Post Shipment
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShipmentForm;