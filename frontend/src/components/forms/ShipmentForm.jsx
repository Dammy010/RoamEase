import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { postShipment } from "../../redux/slices/shipmentSlice";
import {
  Package,
  MapPin,
  Calendar,
  Truck,
  Weight,
  Ruler,
  Upload,
  FileText,
  Image,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Shield,
  AlertCircle,
  Clock,
  Globe,
  User,
  Phone,
  Mail,
  Info,
  Star,
} from "lucide-react";

const SectionHeader = ({ title, icon: Icon, description }) => (
  <div className="mb-8">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
        <Icon className="text-white" size={20} />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
        {title}
      </h2>
    </div>
    {description && <p className="text-gray-600 text-lg">{description}</p>}
  </div>
);

const Input = ({ label, id, required, icon: Icon, error, ...props }) => (
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
        className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:border-indigo-500 outline-none transition-all duration-200 ${
          Icon ? "pl-10" : ""
        } ${
          error
            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300 focus:ring-indigo-500 hover:border-gray-400"
        }`}
      />
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
        <AlertCircle size={14} />
        {error}
      </p>
    )}
  </div>
);

const TextArea = ({ label, id, required, icon: Icon, error, ...props }) => (
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
        className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:border-indigo-500 outline-none transition-all duration-200 resize-none ${
          Icon ? "pl-10" : ""
        } ${
          error
            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300 focus:ring-indigo-500 hover:border-gray-400"
        }`}
      />
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
        <AlertCircle size={14} />
        {error}
      </p>
    )}
  </div>
);

const Select = ({
  label,
  id,
  options,
  required,
  icon: Icon,
  error,
  ...props
}) => (
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
        className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:border-indigo-500 outline-none transition-all duration-200 ${
          Icon ? "pl-10" : ""
        } ${
          error
            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300 focus:ring-indigo-500 hover:border-gray-400"
        }`}
      >
        <option value="">Select {label?.toLowerCase()}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
        <AlertCircle size={14} />
        {error}
      </p>
    )}
  </div>
);

const RadioGroup = ({
  label,
  name,
  options,
  value,
  onChange,
  required,
  icon: Icon,
  error,
}) => (
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
              ? "border-indigo-500 bg-indigo-50"
              : error
              ? "border-red-200 hover:border-red-300"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
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
          <div
            className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
              value === option
                ? "border-indigo-500 bg-indigo-500"
                : error
                ? "border-red-300"
                : "border-gray-300"
            }`}
          >
            {value === option && (
              <div className="w-2 h-2 rounded-full bg-white dark:bg-gray-800"></div>
            )}
          </div>
          <span className="font-medium text-gray-700">{option}</span>
        </label>
      ))}
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
        <AlertCircle size={14} />
        {error}
      </p>
    )}
  </div>
);

const FileUpload = ({
  label,
  accept,
  multiple,
  onChange,
  files,
  type = "photos",
}) => (
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
          {type === "photos"
            ? "PNG, JPG, JPEG up to 10MB"
            : "PDF, DOC, DOCX up to 10MB"}
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
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <FileText className="text-gray-500" size={20} />
                  <span className="text-sm font-medium text-gray-700">
                    {file.name}
                  </span>
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

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const dispatch = useDispatch();

  // Validation functions
  const validateField = useCallback(
    (name, value) => {
      const newErrors = { ...errors };

      switch (name) {
        case "shipmentTitle":
          if (!value.trim()) {
            newErrors[name] = "Shipment title is required";
          } else if (value.trim().length < 5) {
            newErrors[name] = "Shipment title must be at least 5 characters";
          } else {
            delete newErrors[name];
          }
          break;

        case "descriptionOfGoods":
          if (!value.trim()) {
            newErrors[name] = "Description of goods is required";
          } else if (value.trim().length < 10) {
            newErrors[name] = "Description must be at least 10 characters";
          } else {
            delete newErrors[name];
          }
          break;

        case "typeOfGoods":
          if (!value) {
            newErrors[name] = "Type of goods is required";
          } else {
            delete newErrors[name];
          }
          break;

        case "weight":
          if (!value) {
            newErrors[name] = "Weight is required";
          } else if (isNaN(value) || parseFloat(value) <= 0) {
            newErrors[name] = "Weight must be a positive number";
          } else {
            delete newErrors[name];
          }
          break;

        case "length":
        case "width":
        case "height":
          if (!value) {
            newErrors[name] = `${
              name.charAt(0).toUpperCase() + name.slice(1)
            } is required`;
          } else if (isNaN(value) || parseFloat(value) <= 0) {
            newErrors[name] = `${
              name.charAt(0).toUpperCase() + name.slice(1)
            } must be a positive number`;
          } else {
            delete newErrors[name];
          }
          break;

        case "quantity":
          if (!value) {
            newErrors[name] = "Quantity is required";
          } else if (isNaN(value) || parseInt(value) <= 0) {
            newErrors[name] = "Quantity must be a positive number";
          } else {
            delete newErrors[name];
          }
          break;

        case "pickupAddress":
        case "deliveryAddress":
          if (!value.trim()) {
            newErrors[name] = `${
              name.includes("pickup") ? "Pickup" : "Delivery"
            } address is required`;
          } else if (value.trim().length < 10) {
            newErrors[name] = `${
              name.includes("pickup") ? "Pickup" : "Delivery"
            } address must be at least 10 characters`;
          } else {
            delete newErrors[name];
          }
          break;

        case "pickupCity":
        case "deliveryCity":
          if (!value.trim()) {
            newErrors[name] = `${
              name.includes("pickup") ? "Pickup" : "Delivery"
            } city is required`;
          } else {
            delete newErrors[name];
          }
          break;

        case "pickupCountry":
        case "deliveryCountry":
          if (!value) {
            newErrors[name] = `${
              name.includes("pickup") ? "Pickup" : "Delivery"
            } country is required`;
          } else {
            delete newErrors[name];
          }
          break;

        case "preferredPickupDate":
        case "preferredDeliveryDate":
          if (!value) {
            newErrors[name] = `${
              name.includes("Pickup") ? "Pickup" : "Delivery"
            } date is required`;
          } else {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
              newErrors[name] = `${
                name.includes("Pickup") ? "Pickup" : "Delivery"
              } date cannot be in the past`;
            } else {
              delete newErrors[name];
            }
          }
          break;

        case "pickupContactPerson":
        case "deliveryContactPerson":
          if (!value.trim()) {
            newErrors[name] = `${
              name.includes("pickup") ? "Pickup" : "Delivery"
            } contact person is required`;
          } else if (value.trim().length < 2) {
            newErrors[name] = `${
              name.includes("pickup") ? "Pickup" : "Delivery"
            } contact person must be at least 2 characters`;
          } else {
            delete newErrors[name];
          }
          break;

        case "pickupPhoneNumber":
        case "deliveryPhoneNumber":
          if (!value.trim()) {
            newErrors[name] = `${
              name.includes("pickup") ? "Pickup" : "Delivery"
            } phone number is required`;
          } else {
            // Remove all non-digit characters for validation
            const digitsOnly = value.replace(/\D/g, "");
            if (digitsOnly.length < 10) {
              newErrors[name] = "Phone number must have at least 10 digits";
            } else if (digitsOnly.length > 15) {
              newErrors[name] = "Phone number cannot exceed 15 digits";
            } else {
              delete newErrors[name];
            }
          }
          break;

        case "modeOfTransport":
          if (!value) {
            newErrors[name] = "Mode of transport is required";
          } else {
            delete newErrors[name];
          }
          break;

        case "insuranceRequired":
          if (!value) {
            newErrors[name] = "Insurance requirement is required";
          } else {
            delete newErrors[name];
          }
          break;

        default:
          break;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [errors]
  );

  const validateStep = useCallback(
    (stepIndex) => {
      const newErrors = {};

      switch (stepIndex) {
        case 0: // Shipment Details
          if (!formData.shipmentTitle.trim())
            newErrors.shipmentTitle = "Shipment title is required";
          if (!formData.descriptionOfGoods.trim())
            newErrors.descriptionOfGoods = "Description is required";
          break;

        case 1: // Goods Specifications
          if (!formData.typeOfGoods)
            newErrors.typeOfGoods = "Type of goods is required";
          if (!formData.weight) newErrors.weight = "Weight is required";
          if (!formData.length) newErrors.length = "Length is required";
          if (!formData.width) newErrors.width = "Width is required";
          if (!formData.height) newErrors.height = "Height is required";
          if (!formData.quantity) newErrors.quantity = "Quantity is required";
          break;

        case 2: // Pickup Information
          if (!formData.pickupAddress.trim())
            newErrors.pickupAddress = "Pickup address is required";
          if (!formData.pickupCity.trim())
            newErrors.pickupCity = "Pickup city is required";
          if (!formData.pickupCountry)
            newErrors.pickupCountry = "Pickup country is required";
          if (!formData.preferredPickupDate)
            newErrors.preferredPickupDate = "Pickup date is required";
          if (!formData.pickupContactPerson.trim())
            newErrors.pickupContactPerson = "Pickup contact is required";
          if (!formData.pickupPhoneNumber.trim())
            newErrors.pickupPhoneNumber = "Pickup phone is required";
          break;

        case 3: // Delivery Information
          if (!formData.deliveryAddress.trim())
            newErrors.deliveryAddress = "Delivery address is required";
          if (!formData.deliveryCity.trim())
            newErrors.deliveryCity = "Delivery city is required";
          if (!formData.deliveryCountry)
            newErrors.deliveryCountry = "Delivery country is required";
          if (!formData.preferredDeliveryDate)
            newErrors.preferredDeliveryDate = "Delivery date is required";
          if (!formData.deliveryContactPerson.trim())
            newErrors.deliveryContactPerson = "Delivery contact is required";
          if (!formData.deliveryPhoneNumber.trim())
            newErrors.deliveryPhoneNumber = "Delivery phone is required";
          break;

        case 4: // Transport & Insurance
          if (!formData.modeOfTransport)
            newErrors.modeOfTransport = "Mode of transport is required";
          if (!formData.insuranceRequired)
            newErrors.insuranceRequired = "Insurance requirement is required";
          break;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [formData]
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      validateField(name, value);
    },
    [validateField]
  );

  const handlePhoneChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      // Only allow numbers, +, -, (, ), and spaces
      const phoneValue = value.replace(/[^0-9+\-() ]/g, "");
      setFormData((prev) => ({ ...prev, [name]: phoneValue }));
      validateField(name, phoneValue);
    },
    [validateField]
  );

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
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  }, []);

  const handleNextStep = useCallback(() => {
    const isValid = validateStep(step);

    if (isValid) {
      setStep(step + 1);
    } else {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const errorElement = document.querySelector(
          `[name="${firstErrorField}"]`
        );
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
          errorElement.focus();
        }
      }
    }
  }, [step, validateStep, errors]);

  const handlePrevStep = useCallback(() => {
    setStep(step - 1);
  }, [step]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      // Validate all steps before submission
      const allStepsValid = [0, 1, 2, 3].every((stepIndex) => {
        const stepErrors = {};
        switch (stepIndex) {
          case 0:
            if (!formData.shipmentTitle.trim())
              stepErrors.shipmentTitle = "Required";
            if (!formData.descriptionOfGoods.trim())
              stepErrors.descriptionOfGoods = "Required";
            if (!formData.typeOfGoods) stepErrors.typeOfGoods = "Required";
            if (!formData.weight) stepErrors.weight = "Required";
            if (!formData.length) stepErrors.length = "Required";
            if (!formData.width) stepErrors.width = "Required";
            if (!formData.height) stepErrors.height = "Required";
            if (!formData.quantity) stepErrors.quantity = "Required";
            break;
          case 1:
            if (!formData.pickupAddress.trim())
              stepErrors.pickupAddress = "Required";
            if (!formData.pickupCity.trim()) stepErrors.pickupCity = "Required";
            if (!formData.pickupCountry) stepErrors.pickupCountry = "Required";
            if (!formData.preferredPickupDate)
              stepErrors.preferredPickupDate = "Required";
            if (!formData.pickupContactPerson.trim())
              stepErrors.pickupContactPerson = "Required";
            if (!formData.pickupPhoneNumber.trim())
              stepErrors.pickupPhoneNumber = "Required";
            break;
          case 2:
            if (!formData.deliveryAddress.trim())
              stepErrors.deliveryAddress = "Required";
            if (!formData.deliveryCity.trim())
              stepErrors.deliveryCity = "Required";
            if (!formData.deliveryCountry)
              stepErrors.deliveryCountry = "Required";
            if (!formData.preferredDeliveryDate)
              stepErrors.preferredDeliveryDate = "Required";
            if (!formData.deliveryContactPerson.trim())
              stepErrors.deliveryContactPerson = "Required";
            if (!formData.deliveryPhoneNumber.trim())
              stepErrors.deliveryPhoneNumber = "Required";
            break;
          case 3:
            if (!formData.modeOfTransport)
              stepErrors.modeOfTransport = "Required";
            if (!formData.insuranceRequired)
              stepErrors.insuranceRequired = "Required";
            break;
        }
        return Object.keys(stepErrors).length === 0;
      });

      if (!allStepsValid) {
        setErrors({
          general: "Please complete all required fields before submitting",
        });
        return;
      }

      if (!formData.confirmDetails || !formData.agreeToPolicy) {
        setErrors({ general: "Please confirm details and agree to policy" });
        return;
      }

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
      // Only append files if they exist
      if (formData.photos && formData.photos.length > 0) {
        formData.photos.forEach((file) => data.append("photos", file));
      }
      if (formData.documents && formData.documents.length > 0) {
        formData.documents.forEach((file) => data.append("documents", file));
      }

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
            error={errors.shipmentTitle}
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
            error={errors.descriptionOfGoods}
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
            <div className="mb-6">
              <label
                htmlFor="typeOfGoods"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Type of Goods
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Package className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="typeOfGoods"
                  name="typeOfGoods"
                  value={formData.typeOfGoods}
                  onChange={handleChange}
                  placeholder="Enter type of goods (e.g., Electronics, Furniture, Documents, etc.)"
                  className={`w-full px-4 py-3 pl-10 border rounded-xl shadow-sm focus:ring-2 focus:border-indigo-500 outline-none transition-all duration-200 ${
                    errors.typeOfGoods
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-indigo-500 hover:border-gray-400"
                  }`}
                  required
                  list="goods-suggestions"
                />
                <datalist id="goods-suggestions">
                  <option value="Electronics" />
                  <option value="Furniture" />
                  <option value="Clothing" />
                  <option value="Food & Beverages" />
                  <option value="Machinery & Equipment" />
                  <option value="Documents" />
                  <option value="Art & Antiques" />
                  <option value="Automotive Parts" />
                  <option value="Medical Supplies" />
                  <option value="Books & Media" />
                  <option value="Sports Equipment" />
                  <option value="Jewelry" />
                  <option value="Textiles" />
                  <option value="Chemicals" />
                  <option value="Agricultural Products" />
                  <option value="Construction Materials" />
                  <option value="Other" />
                </datalist>
              </div>
              {errors.typeOfGoods && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.typeOfGoods}
                </p>
              )}
            </div>
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
              error={errors.weight}
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
              required
              error={errors.length}
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
              required
              error={errors.width}
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
              required
              error={errors.height}
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
            error={errors.quantity}
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
              onChange={handlePhoneChange}
              placeholder="Enter phone number (numbers only)"
              icon={Phone}
              required
              error={errors.pickupPhoneNumber}
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
              onChange={handlePhoneChange}
              placeholder="Enter phone number (numbers only)"
              icon={Phone}
              required
              error={errors.deliveryPhoneNumber}
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
          <div className="bg-blue-50 p-6 rounded-2xl border border-indigo-200">
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
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Package className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Post a Shipment
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with verified logistics providers worldwide and get
            competitive quotes for your shipment
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
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* General Error Display */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-600" size={20} />
              <p className="text-red-800 font-medium">{errors.general}</p>
            </div>
          </div>
        )}

        {/* Step Validation Error Display */}
        {Object.keys(errors).length > 0 && !errors.general && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-yellow-600" size={20} />
              <p className="text-yellow-800 font-medium">
                Please complete all required fields before continuing
              </p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Step Header */}
          <div className="bg-blue-600 p-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white dark:bg-gray-800/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                {React.createElement(steps[step].icon, {
                  className: "text-indigo-600",
                  size: 24,
                })}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {steps[step].title}
                </h2>
                <p className="text-indigo-100 text-lg">
                  {steps[step].description}
                </p>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="p-8">{steps[step].content}</div>

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
                  onClick={handleNextStep}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Continue
                  <ArrowRight size={20} />
                </button>
              ) : (
                <button
                  type="submit"
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 ${
                    loading ||
                    !formData.confirmDetails ||
                    !formData.agreeToPolicy
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-0.5"
                  }`}
                  disabled={
                    loading ||
                    !formData.confirmDetails ||
                    !formData.agreeToPolicy
                  }
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
