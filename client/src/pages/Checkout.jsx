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
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

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

        // Fire and forget - don't wait for response
        axios.post(
          "http://localhost:5000/api/distributor-purchases",
          purchaseData,
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(err => console.error("Purchase error:", err));

        axios.post(
          `http://localhost:5000/api/products/${product._id}/record-distributor-sale`,
          { price: totalPrice },
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(err => console.error("Sale error:", err));
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
        console.log("🔍 Product ID:", product._id);
        console.log("🔍 URL:", `http://localhost:5000/api/products/${product._id}/retailer/sell`);
        
        axios.post(
          `http://localhost:5000/api/products/${product._id}/retailer/sell`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(err => {
          console.error("❌ Retailer sale error:", err);
          console.error("❌ Error response:", err.response?.data);
          console.error("❌ Error status:", err.response?.status);
        });
      }

      // 🚀 Immediate success - don't wait for API response
      setPaymentStatus("success");
      setShowSuccessAnimation(true);
      
      // Quick redirect after 1.5 seconds
      setTimeout(() => {
        if (user.role === "distributor") {
          navigate("/marketplace");
        } 
        else if (user.role === "retailer") {
          navigate("/retailer/marketplace");
        }
      }, 1500);

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

      {showSuccessAnimation && (
        <div className="success-animation">
          <div className="success-checkmark">✓</div>
          <p>Payment Successful!</p>
          <p>Processing blockchain transaction...</p>
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