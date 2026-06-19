import React, { useEffect, useState, useRef } from "react";
import "../styles/DistributorDashboard.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DistributorDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const navigate = useNavigate();
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

<<<<<<< HEAD
=======
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

>>>>>>> d026356 (dockerize all things,changed some code and final update d version)
  useEffect(() => {
    fetchRequests();
    fetchPurchases();
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

<<<<<<< HEAD
=======
  // 📊 PROFIT CALCULATION
  const totalPurchaseCost = purchases.reduce(
    (sum, p) => sum + p.totalPrice,
    0
  );

 const totalSellingRevenue = marketplaceProducts
  .filter((p) => p.status === "COMPLETED")
  .reduce((sum, p) => sum + (p.totalSoldPrice || 0), 0);
  const totalProfit = totalSellingRevenue - totalPurchaseCost;

>>>>>>> d026356 (dockerize all things,changed some code and final update d version)
  return (
    <div className="distributor-dashboard">
      <div className="dashboard-header">
        <h1>🚚 Distributor Dashboard</h1>

        {/* 🔔 Notifications */}
        <div className="bell-container" ref={dropdownRef}>
          <span className="bell-icon" onClick={() => setShowNotifications(!showNotifications)}>
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

      {/* 🛒 PURCHASED PRODUCTS */}
      <center><h2 style={{ marginTop: "30px" }}>🛒 Purchased Products 🛒 </h2></center>

<<<<<<< HEAD
      <div className="crops-grid">
        {purchases.length === 0 && <p>No purchases yet.</p>}

        {purchases.map((p) => (
          <div key={p._id} className="crop-grid-item">
            <div className="crop-grid-details">
               {/* ✅ PRODUCT IMAGE */}
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
              <p>Farmer: {p.farmer?.name}</p>
              <span className="status-badge verified">COMPLETED</span>

              <button
                className="action-btn"
                onClick={() => setSelectedPurchase(p)}
              >
                Get Details
              </button>
=======
      {/* 🔥 RESPONSIVE GRID LAYOUT */}
      <div className="dashboard-grid-container">

        {/* ================= COLUMN 1 ================= */}
        <div className="dashboard-column">
          <center><h2 className="column-title">🛒 Purchased Crops</h2></center>
          <div className="crops-grid">
            {purchases.length === 0 && <p>No purchases yet.</p>}
            {purchases.map((p) => (
              <div key={p._id} className="crop-grid-item">
                <img
                  src={p.product?.image || `https://images.unsplash.com/photo-1511735643442-503bb3bd348a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y3JvcHxlbnwwfHwwfHx8MA%3D%3D/327x154/?${p.variety || "farm,crop"}`}
                  alt={p.variety || "Rice"}
                  className="crop-image"
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }}
                />

                <div className="crop-grid-details">
                  <strong style={{ fontSize: '1.7rem', color: '#2e7d32' }}>{p.variety}</strong>

                  <div style={{ marginTop: '10px', textAlign: 'left', color: '#2e7d32' }}>
                    <p><span>👨‍🌾 Farmer:</span> {p.farmerName || p.farmer?.name || "Unknown"}</p>
                    <p><span>📍 Location:</span> {p.farmerLocation || p.farmer?.address || "N/A"}</p>
                    <p><span>💰 Price:</span> ₹{p.pricePerKg}/kg</p>
                    <p><span>📦 Quantity:</span> {p.quantity} kg</p>
                    <p><span>💵 Total Cost:</span> ₹{p.totalPrice}</p>
                    <p><span>🔗 Purchase TX:</span> {p.purchaseTxHash?.substring(0, 10)}...{p.purchaseTxHash?.substring(p.purchaseTxHash.length - 6)}</p>
                    <p><span>📅 Date:</span> {new Date(p.createdAt).toLocaleDateString()}</p>
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
        <div className="dashboard-column">
          <center><h2 className="column-title">🏪 Marketplace Crops</h2></center>
          <div className="crops-grid">
            {marketplaceProducts.length === 0 && <p>No products added.</p>}
            {marketplaceProducts.map((p) => (
              <div key={p._id} className="crop-grid-item">
                <img
                  src={p.product?.image || `https://images.unsplash.com/photo-1511735643442-503bb3bd348a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y3JvcHxlbnwwfHwwfHx8MA%3D%3D/327x154/?${p.variety || "farm,crop"}`}
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
        <div className="dashboard-column">
          <center><h2 className="column-title">📊 Profit Analysis</h2></center>

          <div className="crop-grid-item">
            <div className="crop-grid-details" style={{ textAlign: 'left', padding: '20px', margin: '20px 0 20px 0' }}>
              <div style={{ marginBottom: '15px' }}>
                <p style={{ fontSize: '1.4em', color: '#666', marginBottom: '5px' }}>Total Purchase Cost</p>
                <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#f44336' }}>₹ {totalPurchaseCost.toLocaleString()}</p>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <p style={{ fontSize: '1.4em', color: '#666', marginBottom: '5px' }}>Total Selling Revenue</p>
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
>>>>>>> d026356 (dockerize all things,changed some code and final update d version)
            </div>
          </div>
        ))}
      </div>

      {/* 🔍 DETAILS MODAL */}
      {selectedPurchase && (
        <div className="modal-backdrop" onClick={() => setSelectedPurchase(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPurchase(null)}>✕</button>

            <h2>{selectedPurchase.variety}</h2>
            <p><strong>Farmer:</strong> {selectedPurchase.farmer?.name}</p>
            <p><strong>Email:</strong> {selectedPurchase.farmer?.email}</p>
            <p><strong>Quantity:</strong> {selectedPurchase.quantity} kg</p>
            <p><strong>Price per Kg:</strong> ₹{selectedPurchase.pricePerKg}</p>
            <p><strong>Total Price:</strong> ₹{selectedPurchase.totalPrice}</p>
            <p><strong>Payment:</strong> {selectedPurchase.paymentMethod}</p>
            <p><strong>Status:</strong> {selectedPurchase.status}</p>
            <p><strong>Date:</strong> {new Date(selectedPurchase.createdAt).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributorDashboard;
