// PostShipment.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import ShipmentForm from "../../components/forms/ShipmentForm";

const PostShipment = () => {
  const navigate = useNavigate();

  return (
    <div>
      <ShipmentForm />
    </div>
  );
};

export default PostShipment;
