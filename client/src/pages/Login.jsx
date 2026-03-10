// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
      setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      // ❌ Login failed
      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }
      
      // ✅ Login success → save user and token
      localStorage.setItem("token", data.token);
      const userData = {
        userId: data.userId,
        role: data.role,
        name: data.name || "User", // ✅ Add name
        email: formData.email // ✅ Add email
      };
      localStorage.setItem("user", JSON.stringify(userData));
      console.log("✅ Login successful:", userData);
      window.dispatchEvent(new Event("userLogin"));

      // Check if user has profile picture; if not, send to setup
      try {
        const userRes = await fetch(`http://localhost:5000/api/auth/user/${data.userId}`);
        const userJson = await userRes.json();
        if (userJson && !userJson.profilePicture) {
          navigate("/setup-profile");
          return;
        }
      } catch (_) {
        // On error, go to dashboard
      }
      navigate(`/${data.role}/dashboard`);

    } catch (err) {
      console.error("Login error:", err);
      setError("Server error. Please try again.");
    }finally {
      setLoading(false);}

  };

  return (
    <div className="login-container">
      <h2>Login to Your Account 🔐</h2>

      {/* ERROR MESSAGE */}
      {error && <p className="error-text">{error}</p>}

      {/* LOGIN FORM */}
      <form className="login-form" onSubmit={handleSubmit}>
        <label>Email *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          required
          onChange={handleChange}
        />

        <label>Password *</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          required
          onChange={handleChange}
        />

        <button type="submit" className="submit-btn">
         {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;