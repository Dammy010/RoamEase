// PostShipment.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import ShipmentForm from "../../components/forms/ShipmentForm";
import { Package, Plus, ArrowRight, Settings } from "lucide-react";

const PostShipment = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-blue-600 rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/user/dashboard")}
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 border border-white/20"
                >
                  <ArrowRight className="rotate-180 text-white" size={20} />
                </button>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                  <Plus className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Post New Shipment
                  </h1>
                  <p className="text-indigo-100 text-lg">
                    Create a new shipment and connect with logistics providers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <ShipmentForm />
        </div>
      </div>
    </div>
  );
};

export default PostShipment;
