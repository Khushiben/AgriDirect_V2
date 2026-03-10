import React, { useEffect, useState, useRef } from "react";
import "../styles/DistributorDashboard.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AddProducts from "./AddProducts"; // correct relative path
import DistributorMap from "../components/DistributorMap";

const DistributorDashboard = () => {
  const navigate = useNavigate(); // ✅ MOVE THIS UP

  const [requests, setRequests] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [marketplaceProducts, setMarketplaceProducts] = useState([]);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // ✅ NOW navigate is available here
  const navigateToAddProduct = (purchase) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      console.log("✅ Fetched purchases:", res.data);
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
        "http://localhost:5000/api/distributortomarketplaces/my-products",
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
                  <p>👨‍🌾 Farmer: {p.farmer?.name || "Unknown Farmer"}</p>
                  <p>📍 {p.farmer?.address || "Location N/A"}</p>
                  <p>📦 Qty: {p.quantity} kg</p>
                  <p>💰 Price: ₹{p.price}/kg</p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button onClick={() => handleApprove(p._id)} style={{ flex: 1 }}>✅ Approve</button>
                    <button onClick={() => handleReject(p._id)} style={{ flex: 1, background: '#f44336' }}>❌ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Distributor Map Section */}
      <DistributorMap distributorId="distributor123" />

      {/* 🔥 THREE COLUMN LAYOUT */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.9fr", gap: "20px", marginTop: "30px" }}>

        {/* ================= COLUMN 1 ================= */}
        <div>
          <center><h2>🛒 Purchased Crops</h2></center>
          <div className="crops-grid">
            {purchases.length === 0 && <p>No purchases yet.</p>}
            {purchases.map((p) => (
              <div key={p._id} className="crop-grid-item">
                <img
                  src="https://lh3.googleusercontent.com/pw/AP1GczOYZe0-gl9tYo4EJ8ilUZClxIOQ4IvLq8JfM6bkt_t3zugpd64crKv3oJ6TPd_RNqxoTC1iIziNkyls9Lbe0Qr7JR04tqlzQ0mpLcz-6JtBe5l43Qd1n33dACBC5DEn-vh6uF3RjpUAfZoUWQlHvqwbDw=w327-h154-s-no-gm"
                  alt={p.variety || "Rice"}
                  className="crop-image"
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }}
                />
                
                <div className="crop-grid-details">
                  <strong style={{ fontSize: '1.2em', color: '#2e7d32' }}>{p.variety}</strong>
                  
                  <div style={{ marginTop: '10px', textAlign: 'left' }}>
                    <p><strong>👨‍🌾 Farmer:</strong> {p.farmerName || p.farmer?.name || "Unknown"}</p>
                    <p><strong>📍 Location:</strong> {p.farmerLocation || p.farmer?.address || "N/A"}</p>
                    <p><strong>👤 Admin:</strong> {p.adminName || "N/A"}</p>
                    <p><strong>💰 Price:</strong> ₹{p.pricePerKg}/kg</p>
                    <p><strong>📦 Quantity:</strong> {p.quantity} kg</p>
                    <p><strong>💵 Total Cost:</strong> ₹{p.totalPrice}</p>
                    <p><strong>🔗 Purchase TX:</strong> <code style={{ fontSize: '0.7em' }}>{p.purchaseTxHash?.substring(0, 10)}...{p.purchaseTxHash?.substring(p.purchaseTxHash.length - 6)}</code></p>
                    <p><strong>📅 Date:</strong> {new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  <span className="status-badge verified" style={{ marginTop: '10px' }}>PURCHASED</span>

                  <button
                    className="add-to-marketplace-btn"
                    onClick={() => navigateToAddProduct(p)}
                    style={{ marginTop: '10px', width: '100%' }}
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
          <div className="crops-grid" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {marketplaceProducts.length === 0 && <p>No products added.</p>}
            {marketplaceProducts.map((p) => (
              <div key={p._id} className="crop-grid-item">
                <img
                  src="https://lh3.googleusercontent.com/pw/AP1GczOYZe0-gl9tYo4EJ8ilUZClxIOQ4IvLq8JfM6bkt_t3zugpd64crKv3oJ6TPd_RNqxoTC1iIziNkyls9Lbe0Qr7JR04tqlzQ0mpLcz-6JtBe5l43Qd1n33dACBC5DEn-vh6uF3RjpUAfZoUWQlHvqwbDw=w327-h154-s-no-gm"
                  alt={p.variety || "Rice"}
                  className="crop-image"
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }}
                />
                
                <div className="crop-grid-details">
                  <strong style={{ fontSize: '1.2em', color: '#2e7d32' }}>{p.variety}</strong>
                  
                  <div style={{ marginTop: '10px', textAlign: 'left' }}>
                    <p><strong>👨‍🌾 Farmer:</strong> {p.farmerName || "Unknown"}</p>
                    <p><strong>📍 Location:</strong> {p.farmerLocation || "N/A"}</p>
                    <p><strong>💰 Selling Price:</strong> ₹{p.sellingPrice}/kg</p>
                    <p><strong>📦 Available:</strong> {p.quantity} kg</p>
                    <p><strong>💵 Purchase Cost:</strong> ₹{p.purchasePrice}/kg</p>
                    <p><strong>📈 Profit/kg:</strong> ₹{p.profit}</p>
                    {p.status === "COMPLETED" && p.totalSoldPrice && (
                      <p><strong>💰 Total Sold:</strong> ₹{p.totalSoldPrice}</p>
                    )}
                    <p><strong>🔗 Listing TX:</strong> <code style={{ fontSize: '0.7em' }}>{p.listingTxHash?.substring(0, 10)}...{p.listingTxHash?.substring(p.listingTxHash?.length - 6)}</code></p>
                  </div>

                  {p.status === "COMPLETED" ? (
                    <span className="status-badge verified" style={{ marginTop: '10px' }}>✅ COMPLETED</span>
                  ) : (
                    <span className="status-badge pending" style={{ marginTop: '10px' }}>⏳ AVAILABLE</span>
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
            <div className="crop-grid-details" style={{ textAlign: 'left', padding: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px' }}>Total Purchase Cost</p>
                <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#f44336' }}>₹ {totalPurchaseCost.toLocaleString()}</p>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px' }}>Total Selling Revenue</p>
                <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#4caf50' }}>₹ {totalSellingRevenue.toLocaleString()}</p>
              </div>

              <hr style={{ margin: '15px 0', border: 'none', borderTop: '2px solid #ddd' }} />

              <div style={{ marginBottom: '15px' }}>
                <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px' }}>Net Profit/Loss</p>
                <h3 style={{ 
                  fontSize: '2em', 
                  fontWeight: 'bold',
                  color: totalProfit >= 0 ? "#4caf50" : "#f44336",
                  margin: '10px 0'
                }}>
                  {totalProfit >= 0 ? '📈' : '📉'} ₹ {totalProfit.toLocaleString()}
                </h3>
              </div>

              <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.85em', color: '#666', marginBottom: '8px' }}>
                  <strong>📦 Total Purchases:</strong> {purchases.length}
                </p>
                <p style={{ fontSize: '0.85em', color: '#666', marginBottom: '8px' }}>
                  <strong>🏪 Listed Products:</strong> {marketplaceProducts.length}
                </p>
                <p style={{ fontSize: '0.85em', color: '#666' }}>
                  <strong>✅ Completed Sales:</strong> {marketplaceProducts.filter(p => p.status === "COMPLETED").length}
                </p>
              </div>

              {totalProfit > 0 && (
                <div style={{ marginTop: '15px', padding: '10px', background: '#e8f5e9', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.85em', color: '#2e7d32', margin: 0 }}>
                    🎉 Great job! You're making profit!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DistributorDashboard;