import React, { useEffect, useState, useRef } from "react";
import "../styles/DistributorDashboard.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AddProducts from "./AddProducts"; // correct relative path

const DistributorDashboard = () => {
  const navigate = useNavigate(); // ✅ MOVE THIS UP

  const [requests, setRequests] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [marketplaceProducts, setMarketplaceProducts] = useState([]);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // ✅ NOW navigate is available here
  const navigateToAddProduct = (purchase) => {
    navigate("/add-products", { state: { purchase } });
  };

  const dropdownRef = useRef(null);

  // 🔔 Fetch pending approval requests
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/products/distributor/requests",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(res.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  // 🛒 Fetch distributor purchases
  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/distributor-purchases/my-purchases",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPurchases(res.data);
    } catch (error) {
      console.error("Error fetching purchases:", error);
    }
  };

  // 🏪 Fetch distributor marketplace products
  const fetchMarketplaceProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/distributor-marketplace/my-products",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMarketplaceProducts(res.data);
    } catch (error) {
      console.error("Error fetching marketplace products:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchPurchases();
    fetchMarketplaceProducts();
  }, []);

  const handleApprove = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/products/${productId}/distributor/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/checkout?productId=${productId}`);
    } catch (error) {
      console.error("Approve error:", error);
    }
  };

  const handleReject = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/products/${productId}/distributor/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRequests();
      alert("Rejected, farmer will be notified");
    } catch (error) {
      console.error("Reject error:", error);
    }
  };

  // 🔕 Close notification dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 📊 PROFIT CALCULATION
  const totalPurchaseCost = purchases.reduce(
    (sum, p) => sum + p.totalPrice,
    0
  );

  const totalSellingRevenue = marketplaceProducts
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.totalSoldPrice, 0);

  const totalProfit = totalSellingRevenue - totalPurchaseCost;

  return (
    <div className="distributor-dashboard">
      <div className="dashboard-header">
        <h1 style={{ justifyContent: "center" }}>🚚 Distributor Dashboard</h1>

        {/* 🔔 Notifications */}
        <div className="bell-container" ref={dropdownRef}>
          <span
            className="bell-icon"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔
            {requests.length > 0 && (
              <span className="bell-badge">{requests.length}</span>
            )}
          </span>

          {showNotifications && (
            <div className="notification-dropdown">
              <h3>Pending Requests</h3>
              {requests.length === 0 && <p>No pending requests</p>}
              {requests.map((p) => (
                <div key={p._id} className="request-card">
                  <p><strong>{p.variety}</strong></p>
                  <p>Farmer: {p.farmer?.name}</p>
                  <p>Qty: {p.quantity} kg | ₹{p.price}</p>
                  <button onClick={() => handleApprove(p._id)}>Approve</button>
                  <button onClick={() => handleReject(p._id)}>Reject</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🔥 THREE COLUMN LAYOUT */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "30px", marginTop: "30px" }}>

        {/* ================= COLUMN 1 ================= */}
        <div>
          <center><h2>🛒 Purchased Crops</h2></center>
          <div className="crops-grid">
            {purchases.length === 0 && <p>No purchases yet.</p>}
            {purchases.map((p) => (
              <div key={p._id} className="crop-grid-item">
                <div className="crop-grid-details">
                  {p.product?.image && (
                    <img
                      src={`http://localhost:5000/uploads/licenses/${p.product.image}`}
                      alt={p.variety}
                      className="crop-image"
                    />
                  )}
                  <strong>{p.variety}</strong>
                  <p>₹ {p.pricePerKg} / kg</p>
                  <p>Quantity: {p.quantity} kg</p>
                  <p>Total: ₹ {p.totalPrice}</p>
                  <span className="status-badge verified">PURCHASED</span>

                  {/* ✅ REDIRECTION WORKS */}
                  <button
                    className="add-to-marketplace-btn"
                    onClick={() => navigateToAddProduct(p)}
                  >
                    ➕ Add to Marketplace
                  </button>

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= COLUMN 2 ================= */}
        <div>
          <center><h2>🏪 Marketplace Crops</h2></center>
          <div className="crops-grid">
            {marketplaceProducts.length === 0 && <p>No products added.</p>}
            {marketplaceProducts.map((p) => (
              <div key={p._id} className="crop-grid-item">
                <div className="crop-grid-details">
                  {p.image && (
                    <img
                      src={`http://localhost:5000/uploads/licenses/${p.image}`}
                      alt={p.variety}
                      className="crop-image"
                    />
                  )}
                  <strong>{p.variety}</strong>
                  <p>₹ {p.sellingPricePerKg} / kg</p>
                  <p>Quantity: {p.quantity} kg</p>

                  {p.status === "COMPLETED" ? (
                    <span className="status-badge verified">COMPLETED</span>
                  ) : (
                    <span className="status-badge pending">IN PROGRESS</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= COLUMN 3 ================= */}
        <div>
          <center><h2>📊 Profit Analysis</h2></center>

          <div className="crop-grid-item">
            <div className="crop-grid-details">
              <p><strong>Total Purchase Cost:</strong></p>
              <p>₹ {totalPurchaseCost}</p>

              <p><strong>Total Selling Revenue:</strong></p>
              <p>₹ {totalSellingRevenue}</p>

              <p><strong>Total Profit:</strong></p>
              <h3 style={{ color: totalProfit >= 0 ? "green" : "red" }}>
                ₹ {totalProfit}
              </h3>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DistributorDashboard;