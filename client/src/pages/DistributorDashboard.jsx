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
