import "../styles/AddProduct.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function AddDProduct() {
  const navigate = useNavigate();
  const location = useLocation();

  // Receive product data from navigation
  const { purchase } = location.state || {};
  const minPrice = purchase?.product?.minPrice || 0;
  const maxPrice = purchase?.product?.maxPrice || 0;

  const [formData, setFormData] = useState({
    productForm: "",
    cleaning: "No",
    stoneRemoval: "No",
    millingRequired: "No",
    transportCost: "0",
    loadingCost: "0",
    storageCost: "0",
    processingCost: "0",
    otherCost: "0",
    purchasePrice: purchase?.pricePerKg || "",
    sellingPrice: "",
    quantity: purchase?.quantity || ""
  });

  const [profit, setProfit] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [showETHModal, setShowETHModal] = useState(false);
  const [ethTxDetails, setEthTxDetails] = useState(null);
  const [txStatus, setTxStatus] = useState("processing");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Auto Profit Calculation
  useEffect(() => {
    const calculatedTotalCost =
      Number(formData.purchasePrice || 0) +
      Number(formData.transportCost || 0) +
      Number(formData.loadingCost || 0) +
      Number(formData.storageCost || 0) +
      Number(formData.processingCost || 0) +
      Number(formData.otherCost || 0);

    const totalSelling = Number(formData.sellingPrice || 0);

    setTotalCost(calculatedTotalCost);
    setProfit((totalSelling - calculatedTotalCost).toFixed(2));
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("productForm", formData.productForm);
      data.append("cleaning", formData.cleaning);
      data.append("stoneRemoval", formData.stoneRemoval);
      data.append("millingRequired", formData.millingRequired);
      data.append("transportCost", formData.transportCost || 0);
      data.append("loadingCost", formData.loadingCost || 0);
      data.append("storageCost", formData.storageCost || 0);
      data.append("processingCost", formData.processingCost || 0);
      data.append("otherCost", formData.otherCost || 0);
      data.append("purchasePrice", formData.purchasePrice);
      data.append("sellingPrice", formData.sellingPrice);
      data.append("quantity", formData.quantity);
      data.append("profit", profit);
      data.append("variety", purchase.variety);
      data.append("productId", purchase.product?._id || purchase.product);

      // Use fixed Google Photos rice image
      data.append("productImage", "https://lh3.googleusercontent.com/pw/AP1GczOYZe0-gl9tYo4EJ8ilUZClxIOQ4IvLq8JfM6bkt_t3zugpd64crKv3oJ6TPd_RNqxoTC1iIziNkyls9Lbe0Qr7JR04tqlzQ0mpLcz-6JtBe5l43Qd1n33dACBC5DEn-vh6uF3RjpUAfZoUWQlHvqwbDw=w327-h154-s-no-gm");
      
      // Pass supply chain data
      data.append("purchaseTxHash", purchase.purchaseTxHash || "N/A");
      data.append("adminApprovalTx", purchase.adminApprovalTx || "N/A");
      data.append("farmerName", purchase.farmerName || "Unknown Farmer");
      data.append("farmerLocation", purchase.farmerLocation || "Unknown Location");
      data.append("adminName", purchase.adminName || "Unknown Admin");

      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/distributor-add-product/add",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Show ETH transaction modal
      const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const gasFee = (Math.random() * 0.01 + 0.005).toFixed(4);
      
      setEthTxDetails({
        txHash: txHash,
        gasFee: gasFee,
        productName: purchase.variety,
        price: formData.sellingPrice,
        quantity: formData.quantity
      });
      setTxStatus("processing");
      setShowETHModal(true);

      // Change to confirmed after 3 seconds
      setTimeout(() => {
        setTxStatus("confirmed");
      }, 3000);

      // Redirect after 5 seconds
      setTimeout(() => {
        navigate("/distributor/dashboard");
      }, 5000);
    } catch (err) {
      console.log(err);
      alert("Error adding distributor product");
    }
  };
  
  return (
    <div className="add-product-container">
      <form className="full-page-form" onSubmit={handleSubmit}>
        <h1 style={{ textAlign: "center", color: "#2e7d32" }}>
          🚚 Distributor Product Processing
        </h1>

        <div className="product-info-card">
          <h2>📦 Product: {purchase.variety}</h2>
          <p><strong>Available Quantity:</strong> {purchase.quantity} kg</p>
          <p><strong>Purchase Price:</strong> ₹{purchase.pricePerKg} / kg</p>
          <p><strong>Total Purchase Cost:</strong> ₹{purchase.totalPrice}</p>

          {purchase.product?.image && (
            <img
              src="https://lh3.googleusercontent.com/pw/AP1GczOYZe0-gl9tYo4EJ8ilUZClxIOQ4IvLq8JfM6bkt_t3zugpd64crKv3oJ6TPd_RNqxoTC1iIziNkyls9Lbe0Qr7JR04tqlzQ0mpLcz-6JtBe5l43Qd1n33dACBC5DEn-vh6uF3RjpUAfZoUWQlHvqwbDw=w327-h154-s-no-gm"
              alt={purchase.variety || "Rice"}
              style={{ width: "200px", margin: "10px 0", borderRadius: "10px" }}
            />
          )}
        </div>

        <div className="form-section">
          <h3>🔧 Product Processing</h3>
          
          <label>Product Form</label>
          <select name="productForm" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Paddy">Paddy (With Husk)</option>
            <option value="Milled">Milled Rice (Without Husk)</option>
          </select>

          {formData.productForm === "Paddy" && (
            <div className="processing-options">
              <label>Milling Required?</label>
              <select name="millingRequired" onChange={handleChange}>
                <option>No</option>
                <option>Yes</option>
              </select>

              <label>Cleaning Required?</label>
              <select name="cleaning" onChange={handleChange}>
                <option>No</option>
                <option>Yes</option>
              </select>

              <label>Stone Removal Required?</label>
              <select name="stoneRemoval" onChange={handleChange}>
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>
          )}
        </div>

        <div className="form-section charges-section">
          <h3>💰 Costs & Charges Breakdown</h3>

          <div className="charge-item">
            <label>Purchase Price (per kg)</label>
            <input
              type="number"
              name="purchasePrice"
              value={formData.purchasePrice}
              onChange={handleChange}
              required
              readOnly
              className="readonly-input"
            />
          </div>

          <div className="charge-item">
            <label>🚛 Transport Cost</label>
            <input 
              type="number" 
              name="transportCost" 
              value={formData.transportCost}
              onChange={handleChange}
              placeholder="Enter transport cost"
            />
          </div>

          <div className="charge-item">
            <label>📦 Loading/Unloading Cost</label>
            <input 
              type="number" 
              name="loadingCost" 
              value={formData.loadingCost}
              onChange={handleChange}
              placeholder="Enter loading cost"
            />
          </div>

          <div className="charge-item">
            <label>🏪 Storage Cost</label>
            <input 
              type="number" 
              name="storageCost" 
              value={formData.storageCost}
              onChange={handleChange}
              placeholder="Enter storage cost"
            />
          </div>

          <div className="charge-item">
            <label>⚙️ Processing Cost</label>
            <input 
              type="number" 
              name="processingCost" 
              value={formData.processingCost}
              onChange={handleChange}
              placeholder="Enter processing cost"
            />
          </div>

          <div className="charge-item">
            <label>📋 Other Cost</label>
            <input 
              type="number" 
              name="otherCost" 
              value={formData.otherCost}
              onChange={handleChange}
              placeholder="Enter other costs"
            />
          </div>

          <div className="total-cost-display">
            <h4>Total Cost: ₹{totalCost.toFixed(2)}</h4>
          </div>
        </div>

        <div className="form-section">
          <h3>💵 Selling Price</h3>
          
          <label>Selling Price (per kg)</label>
          <input
            type="number"
            name="sellingPrice"
            value={formData.sellingPrice}
            step="0.01"
            onChange={handleChange}
            required
            placeholder="Enter your selling price"
          />

          {minPrice > 0 && maxPrice > 0 && (
            <p className="price-range-hint">
              💡 Admin Approved range: ₹{minPrice} - ₹{maxPrice}
            </p>
          )}
        </div>

        <div className="profit-display">
          <h3 style={{ color: profit >= 0 ? "#2e7d32" : "#d32f2f" }}>
            {profit >= 0 ? "📈" : "📉"} Estimated Profit: ₹{profit}
          </h3>
          {profit < 0 && (
            <p className="warning-text">⚠️ Warning: You're selling at a loss!</p>
          )}
        </div>

        <button type="submit" className="submit-btn">
          ✅ Submit to Marketplace
        </button>
      </form>

      {/* ETH Transaction Modal */}
      {showETHModal && ethTxDetails && (
        <div className="eth-modal-backdrop" onClick={() => setShowETHModal(false)}>
          <div className="eth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowETHModal(false)}>✕</button>
            
            <div className="eth-icon">⟠</div>
            <h2>{txStatus === "processing" ? "Processing Transaction..." : "Transaction Confirmed"}</h2>
            <p className="eth-subtitle">
              {txStatus === "processing" ? "Please wait while we process your listing" : "Product added to marketplace"}
            </p>
            
            <div className="eth-details">
              <div className="eth-row">
                <span className="eth-label">Product:</span>
                <span className="eth-value">{ethTxDetails.productName}</span>
              </div>
              
              <div className="eth-row">
                <span className="eth-label">Quantity:</span>
                <span className="eth-value">{ethTxDetails.quantity} kg</span>
              </div>
              
              <div className="eth-row">
                <span className="eth-label">Selling Price:</span>
                <span className="eth-value">₹{ethTxDetails.price}/kg</span>
              </div>
              
              <div className="eth-row">
                <span className="eth-label">Gas Fee:</span>
                <span className="eth-value">{ethTxDetails.gasFee} ETH</span>
              </div>
              
              <div className="eth-row">
                <span className="eth-label">Transaction Hash:</span>
                <span className="eth-value eth-hash">{ethTxDetails.txHash}</span>
              </div>
              
              <div className="eth-row">
                <span className="eth-label">Status:</span>
                <span className={`eth-value ${txStatus === "processing" ? "eth-processing" : "eth-success"}`}>
                  {txStatus === "processing" ? (
                    <>
                      <span className="spinner-eth"></span> Processing...
                    </>
                  ) : (
                    "✓ Confirmed"
                  )}
                </span>
              </div>
            </div>
            
            <button 
              className="eth-close-btn" 
              onClick={() => setShowETHModal(false)}
              disabled={txStatus === "processing"}
            >
              {txStatus === "processing" ? "Please Wait..." : "Close"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}