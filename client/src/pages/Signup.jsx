import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Signup.css";

const Signup = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    state: "",
    district: "",
    licenseId: "",
    licenseFile: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!role) {
      alert("Please select a role");
      return;
    }

    const payload = {
      role,
      ...formData,
    };

    try {
      const form = new FormData();
      Object.keys(payload).forEach((key) => {
        if (payload[key] !== null && payload[key] !== "") {
          form.append(key, payload[key]);
        }
      });

      const response = await fetch(
        "http://localhost:5000/api/auth/signup",
        {
          method: "POST",
          body: form,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      setSuccessMsg("✅ Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Signup error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="signup-container">
      <h2>Create Account – Get Started 🧭</h2>

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

      {/* FORM */}
      {role && (
        <form className="signup-form" onSubmit={handleSubmit}>
          <label>
            Full Name <span className="required">*</span>
          </label>
          <input type="text" name="name" required onChange={handleChange} />

          <label>
            Email <span className="required">*</span>
          </label>
          <input type="email" name="email" required onChange={handleChange} />

          <label>
            Mobile Number <span className="required">*</span>
          </label>
          <input type="tel" name="phone" required onChange={handleChange} />

          <label>
            Password <span className="required">*</span>
          </label>
          <input
            type="password"
            name="password"
            required
            onChange={handleChange}
          />

          {/* LICENSE + DOCUMENT */}
          {(role === "farmer" ||
            role === "distributor" ||
            role === "retailer") && (
            <>
              <label>
                Government Registration ID <span className="required">*</span>
              </label>
              <input
                type="text"
                name="licenseId"
                required
                onChange={handleChange}
              />

              <label>
                Upload Registration Proof <span className="required">*</span>
              </label>
              <input
                type="file"
                name="licenseFile"
                accept=".jpg,.png,.pdf"
                required
                onChange={handleChange}
              />
            </>
          )}

          {/* ADDRESS (NOT FOR ADMIN) */}
          {role !== "admin" && (
            <>
              <label>
                State <span className="required">*</span>
              </label>
              <input
                type="text"
                name="state"
                required
                onChange={handleChange}
              />

              <label>
                District <span className="required">*</span>
              </label>
              <input
                type="text"
                name="district"
                required
                onChange={handleChange}
              />

              <label>
                Address <span className="required">*</span>
              </label>
              <textarea
                name="address"
                rows="3"
                required
                onChange={handleChange}
              ></textarea>
            </>
          )}

          <button type="submit" className="submit-btn">
            Register
          </button>

          {successMsg && (
            <p className="success-msg">{successMsg}</p>
          )}
        </form>
      )}
    </div>
  );
};

export default Signup;