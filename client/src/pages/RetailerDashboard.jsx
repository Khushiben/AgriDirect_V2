import React, { useEffect, useState } from "react";
import "../styles/RetailerDashboard.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";   // ✅ Added

const RetailerDashboard = () => {
  const [purchases, setPurchases] = useState([]);
  const navigate = useNavigate();   // ✅ Added

  // 🔥 Fetch retailer purchases
  const fetchRetailerPurchases = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/retailer-purchases/my-purchases",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPurchases(res.data);
    } catch (error) {
      console.error("Error fetching retailer purchases:", error);
    }
  };

  useEffect(() => {
    fetchRetailerPurchases();
  }, []);

  return (
    <div className="retailer-dashboard">
      <h1>🏪 Retailer Dashboard</h1>

      <div className="dashboard-section">
        <center><h2>🛒 Purchased from Distributor</h2></center>

        <div className="crops-grid">
          {purchases.length === 0 && <p>No purchases yet.</p>}

          {purchases.map((p) => (
            <div key={p._id} className="crop-grid-item">
              <div className="crop-grid-details">

                <img
                  src="https://lh3.googleusercontent.com/pw/AP1GczOYZe0-gl9tYo4EJ8ilUZClxIOQ4IvLq8JfM6bkt_t3zugpd64crKv3oJ6TPd_RNqxoTC1iIziNkyls9Lbe0Qr7JR04tqlzQ0mpLcz-6JtBe5l43Qd1n33dACBC5DEn-vh6uF3RjpUAfZoUWQlHvqwbDw=w327-h154-s-no-gm"
                  alt={p.variety || "Rice"}
                  className="crop-image"
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }}
                />

                <strong>{p.variety}</strong>

                <p>Distributor: {p.distributorName}</p>

                <p>Price: ₹ {p.pricePerKg} / kg</p>

                <p>Quantity: {p.quantity} kg</p>

                <p>Total Paid: ₹ {p.quantity * p.pricePerKg}</p>

                <span className="status-badge verified">
                  PURCHASED
                </span>

                {/* ✅ NEW BUTTON ADDED */}
                <button
                  className="action-btn buy-btn"
                  style={{ marginTop: "10px" }}
                  onClick={() =>
                    navigate("/retailer-add-product", {
                      state: { product: p }
                    })
                  }
                >
                  Add to Marketplace
                </button>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RetailerDashboard;