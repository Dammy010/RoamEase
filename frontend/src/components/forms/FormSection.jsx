import React from "react";

const FormSection = ({ title, children }) => (
  <div className="bg-gray-50 p-6 rounded-xl shadow-sm mb-8">
    <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3 border-gray-200">
      {title}
    </h3>
    {children}
  </div>
);

export default FormSection;
