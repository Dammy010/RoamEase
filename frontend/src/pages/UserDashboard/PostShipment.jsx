// PostShipment.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import ShipmentForm from "../../components/forms/ShipmentForm";

const PostShipment = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <ShipmentForm />
    </div>
  );
};

export default PostShipment;
