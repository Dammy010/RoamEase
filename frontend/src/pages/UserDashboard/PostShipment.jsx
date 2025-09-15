// PostShipment.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import ShipmentForm from "../../components/forms/ShipmentForm";
import { Package, Plus, ArrowLeft, Settings } from "lucide-react";

const PostShipment = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6"></div>
        <ShipmentForm />
      </div>
    </div>
  );
};

export default PostShipment;
