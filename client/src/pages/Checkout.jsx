import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Checkout.css";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showETHModal, setShowETHModal] = useState(false);
  const [ethTxDetails, setEthTxDetails] = useState(null);
  const [txStatus, setTxStatus] = useState("processing"); // processing or confirmed

  const stateProduct = location.state;
  const query = new URLSearchParams(location.search);
  const productId = query.get("productId");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        // Show loading state
        setLoading(true);

        // 🔹 DISTRIBUTOR → fetch from products
        if (user.role === "distributor") {
          const res = await axios.get(
            `http://localhost:5000/api/products/${productId}`
          );
          setProduct(res.data);
        }

        // 🔹 RETAILER → fetch from distributortomarketplaces
        else if (user.role === "retailer") {
          const res = await axios.get(
            `http://localhost:5000/api/distributortomarketplaces/${productId}`
          );
          setProduct(res.data);
        }

        // 🔹 CONSUMER → fetch from retailer-marketplace
        else if (user.role === "consumer") {
          const res = await axios.get(
            `http://localhost:5000/api/retailer-marketplace/${productId}`
          );
          setProduct(res.data);
        }

        else {
          throw new Error("Unauthorized role");
        }

      } catch (err) {
        console.error("Error fetching product:", err);
        const errorMessage = err.response?.data?.message || err.message || "Failed to load product";
        alert(`Error: ${errorMessage}`);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    // Use stateProduct if available, otherwise fetch
    if (stateProduct) {
      setProduct(stateProduct);
      setLoading(false);
    } else {
      fetchProduct();
    }
  }, [stateProduct, productId, user.role]);

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="checkout-page">
        <div className="error-container">
          <div className="error-icon-large">⚠️</div>
          <h2>Product Not Found</h2>
          <p>The product you're looking for is not available.</p>
          <button className="action-btn secondary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ✅ ROLE BASED PRICE - Round to integer
  const pricePerKg = Math.round(
    user.role === "retailer"
      ? product.sellingPrice
      : user.role === "consumer"
      ? product.totalPrice
      : product.price
  );

  const totalPrice = Math.round(buyQuantity * pricePerKg);

  const handlePayment = async () => {
    setIsProcessingPayment(true);
    setPaymentStatus("");

    try {
      const token = localStorage.getItem("token");
      const totalPrice = Math.round(buyQuantity * (product.sellingPrice || product.price));

      // � Stock validation before API call
      console.log("🔍 Stock check:");
      console.log("  - Requested quantity:", buyQuantity);
      console.log("  - Available stock:", product.quantity);
      console.log("  - Stock sufficient:", buyQuantity <= product.quantity);

      // Prevent purchase if not enough stock
      if (buyQuantity > product.quantity) {
        alert(`Not enough stock available! Available: ${product.quantity}, Requested: ${buyQuantity}`);
        setIsProcessingPayment(false);
        return;
      }

      // � Lightweight payment - immediate response
      const submitButton = document.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Processing...";
      }

      // ==============================
      // 🔹 DISTRIBUTOR FLOW
      // ==============================
      if (user.role === "distributor") {
        const purchaseData = {
          productId: product._id,
          variety: product.variety || product.name,
          quantity: buyQuantity,
          pricePerKg: Math.round(product.price),
          totalPrice: totalPrice,
          farmerId: product.farmer?._id || product.farmer,
          buyerName: user.name || "Anonymous",
        };

        // Create purchase record and record sale
        const purchaseRes = await axios.post(
          "http://localhost:5000/api/distributor-purchases",
          purchaseData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        await axios.post(
          `http://localhost:5000/api/products/${product._id}/record-distributor-sale`,
          { price: totalPrice },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("✅ Distributor purchase completed:", purchaseRes.data);
      }

      // ==============================
      // 🔹 RETAILER FLOW
      // ==============================
      else if (user.role === "retailer") {
        const payload = { 
          price: totalPrice,
          quantity: buyQuantity
        };
        
        console.log("🔍 Sending retailer payment payload:", payload);
        
        await axios.post(
          `http://localhost:5000/api/products/${product._id}/retailer/sell`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("✅ Retailer purchase completed");
      }

      // ==============================
      // 🔹 CONSUMER FLOW
      // ==============================
      else if (user.role === "consumer") {
        const payload = { 
          productId: product._id,
          quantity: buyQuantity,
          totalPrice: totalPrice
        };
        
        console.log("🔍 Sending consumer payment payload:", payload);
        
        await axios.post(
          `http://localhost:5000/api/retailer-marketplace/${product._id}/purchase`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("✅ Consumer purchase completed");
      }

      // 🚀 Show ETH modal with processing status first
      const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const gasFee = (Math.random() * 0.01 + 0.005).toFixed(4);
      
      setEthTxDetails({
        txHash: txHash,
        gasFee: gasFee,
        productName: product.variety || product.name,
        price: totalPrice,
        quantity: buyQuantity
      });
      setTxStatus("processing");
      setShowETHModal(true);
      setPaymentStatus("success");
      
      // Change to confirmed after 3 seconds
      setTimeout(() => {
        setTxStatus("confirmed");
      }, 3000);
      
      // Redirect after 6 seconds total
      setTimeout(() => {
        if (user.role === "distributor") {
          navigate("/distributor/dashboard");
        } 
        else if (user.role === "retailer") {
          navigate("/retailer/marketplace");
        }
        else if (user.role === "consumer") {
          navigate("/consumer/marketplace");
        }
      }, 6000);

    } catch (err) {
      console.error("Payment error:", err);
      setPaymentStatus("failed");
      setIsProcessingPayment(false);
      
      const errorMessage = err.response?.data?.message || err.message || "Payment failed. Try again.";
      alert(`Payment failed: ${errorMessage}`);
    }
  };

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-product">
        <p><strong>Variety:</strong> {product.variety || product.name}</p>
        <p><strong>Available Quantity:</strong> 
          <span style={{ 
            color: product.quantity === 0 ? "red" : product.quantity < 5 ? "orange" : "green",
            fontWeight: "bold"
          }}>
            {product.quantity} kg
            {product.quantity === 0 ? " (OUT OF STOCK)" : 
             product.quantity < 5 ? ` (Only ${product.quantity} left!)` : " (In Stock)"}
          </span>
        </p>

        {/* 🔹 DISTRIBUTOR VIEW */}
        {user.role === "distributor" && (
          <>
            <p><strong>Farmer:</strong> {product.farmer?.name || "Unknown"}</p>
            <p><strong>Price per kg:</strong> ₹ {product.price}</p>
          </>
        )}

        {/* 🔹 RETAILER VIEW */}
        {user.role === "retailer" && (
          <>
            <p><strong>Distributor:</strong> {product.buyerName || "Unknown"}</p>
            <p><strong>Selling Price per kg:</strong> ₹ {product.sellingPrice}</p>
          </>
        )}

        {/* 🔹 CONSUMER VIEW */}
        {user.role === "consumer" && (
          <>
            <p><strong>Retailer:</strong> {product.retailerName || "Unknown"}</p>
            <p><strong>Price per kg:</strong> ₹ {product.totalPrice}</p>
          </>
        )}

        <div style={{ marginTop: "10px" }}>
          <label><strong>Enter Quantity to Buy (kg): </strong></label>
          <input
            type="number"
            min="1"
            max={product.quantity}
            value={buyQuantity}
            onChange={(e) => {
              const newQuantity = Number(e.target.value);
              if (newQuantity > product.quantity) {
                alert(`Maximum available quantity is ${product.quantity} kg`);
                setBuyQuantity(product.quantity);
              } else {
                setBuyQuantity(newQuantity);
              }
            }}
            style={{ 
              padding: "5px", 
              marginLeft: "10px", 
              width: "80px",
              borderColor: buyQuantity > product.quantity ? "red" : "#ddd"
            }}
          />
          {buyQuantity > product.quantity && (
            <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>
              ⚠️ Only {product.quantity} kg available
            </p>
          )}
        </div>

        <p style={{ marginTop: "10px" }}>
          <strong>Total Price:</strong> ₹ {totalPrice}
        </p>
      </div>

      <div className="checkout-buttons">
        <button 
          className={`action-btn ${isProcessingPayment ? 'processing' : ''}`} 
          onClick={handlePayment}
          disabled={isProcessingPayment}
        >
          {isProcessingPayment ? (
            <>
              <span className="spinner"></span>
              Processing Payment...
            </>
          ) : (
            `Pay ₹ ${totalPrice}`
          )}
        </button>

        <button 
          className="action-btn secondary" 
          onClick={() => navigate(-1)}
          disabled={isProcessingPayment}
        >
          Back
        </button>
      </div>

      {showETHModal && ethTxDetails && (
        <div className="eth-modal-backdrop" onClick={() => setShowETHModal(false)}>
          <div className="eth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowETHModal(false)}>✕</button>
            
            <div className="eth-icon">⟠</div>
            <h2>{txStatus === "processing" ? "Processing Transaction..." : "Transaction Confirmed"}</h2>
            <p className="eth-subtitle">
              {txStatus === "processing" ? "Please wait while we process your transaction" : "Purchase completed successfully"}
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
                <span className="eth-label">Total Price:</span>
                <span className="eth-value">₹{ethTxDetails.price}</span>
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

      {paymentStatus === "failed" && (
        <div className="error-animation">
          <div className="error-icon">✗</div>
          <p>Payment Failed!</p>
        </div>
      )}
    </div>
  );
};

export default Checkout;