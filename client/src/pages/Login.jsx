// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!role) {
      setError("Please select a role");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          role,
        }),
      });

      const data = await response.json();

      // ❌ Login failed
      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // ❌ Role mismatch protection
      if (data.role !== role) {
        setError("Role does not match this account");
        return;
      }
      // After successful login
localStorage.setItem("user", JSON.stringify({
  role: data.role,
  email: formData.email
}));

      // ✅ Login success → redirect
      navigate(`/${data.role}/dashboard`);

    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login to Your Account 🔐</h2>

      {/* ROLE SELECTION */}
      <div className="role-selection">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="">Select Role</option>
          <option value="farmer">Farmer</option>
          <option value="consumer">Consumer</option>
          <option value="distributor">Distributor</option>
          <option value="retailer">Retailer</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* ERROR MESSAGE */}
      {error && <p className="error-text">{error}</p>}

      {/* LOGIN FORM */}
      {role && (
        <form className="login-form" onSubmit={handleSubmit}>
          <label>Email *</label>
          <input
            type="email"
            name="email"
            required
            onChange={handleChange}
          />

          <label>Password *</label>
          <input
            type="password"
            name="password"
            required
            onChange={handleChange}
          />

          <button type="submit" className="submit-btn">
            Login
          </button>
        </form>
      )}
    </div>
  );
};

export default Login;