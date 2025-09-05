import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUser } from "../../redux/slices/authSlice";
import PasswordInput from "../shared/PasswordInput"; // New: Import PasswordInput

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const resultAction = await dispatch(loginUser(formData));

      if (loginUser.fulfilled.match(resultAction)) {
        const loggedInUser = resultAction.payload || {};
        const role = loggedInUser.role || "user";

        toast.success("Login successful!");

        // Role-based navigation
        switch (role) {
          case "user":
            navigate("/user/dashboard");
            break;
          case "logistics":
            navigate("/logistics/dashboard");
            break;
          case "admin":
            navigate("/admin/dashboard");
            break;
          default:
            console.warn("Unknown role, redirecting to user dashboard:", role);
            navigate("/user/dashboard");
        }
      } else {
        const msg = resultAction.payload?.message || resultAction.error?.message;
        toast.error(msg || "Login failed");
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoComplete="off"
        required
      />

      {/* New: Use PasswordInput for password */}
      <PasswordInput
        label="Password"
        id="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        autoComplete="new-password"
        required
        className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 px-4 rounded-md text-white transition-colors ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <p className="mt-4 text-center text-gray-600 text-sm">
        Don’t have an account?{" "}
        <Link
          to="/signup"
          className="text-blue-600 font-medium hover:underline"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
