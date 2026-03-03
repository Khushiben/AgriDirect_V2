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

  const stateProduct = location.state;
  const query = new URLSearchParams(location.search);
  const productId = query.get("productId");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (stateProduct) {
          setProduct(stateProduct);
        } else if (productId) {
          const res = await axios.get(
            `http://localhost:5000/api/products/${productId}`
          );
          setProduct(res.data);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        alert("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [stateProduct, productId]);

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found.</p>;

  const totalPrice = buyQuantity * product.price;

  const handlePayment = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const purchaseData = {
        productId: product._id,
        variety: product.variety || product.name,
        quantity: buyQuantity,
        pricePerKg: product.price,
        totalPrice: totalPrice,

        // ✅ FIX (ONLY CHANGE)
        farmerId: product.farmer?._id || product.farmer,

        buyerName: user.name || "Anonymous",
      };

      await axios.post(
        "http://localhost:5000/api/distributor-purchases",
        purchaseData,
        { headers: { Authorization: `Bearer ${token}` } }
      );await axios.post(
  `http://localhost:5000/api/products/${product._id}/record-distributor-sale`,
  { price: totalPrice },
  { headers: { Authorization: `Bearer ${token}` } }
);

      setPaymentStatus("success");
      alert("Payment successful! Purchase saved.");
      navigate("/marketplace");

    } catch (err) {
      console.error("Payment error:", err);
      setPaymentStatus("failed");
      alert("Payment failed. Try again.");
    }
  };

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-product">
        <p><strong>Variety:</strong> {product.variety || product.name}</p>
        <p><strong>Available Quantity:</strong> {product.quantity} kg</p>
        <p><strong>Farmer:</strong> {product.farmer?.name || "Unknown"}</p>
        <p><strong>Price per kg:</strong> ₹ {product.price}</p>

        <div style={{ marginTop: "10px" }}>
          <label><strong>Enter Quantity to Buy (kg): </strong></label>
          <input
            type="number"
            min="1"
            max={product.quantity}
            value={buyQuantity}
            onChange={(e) => setBuyQuantity(Number(e.target.value))}
            style={{ padding: "5px", marginLeft: "10px", width: "80px" }}
          />
        </div>

        <p style={{ marginTop: "10px" }}>
          <strong>Total Price:</strong> ₹ {totalPrice}
        </p>
      </div>

      <div className="checkout-buttons">
        <button className="action-btn" onClick={handlePayment}>
          Pay ₹ {totalPrice} (Dummy Payment)
        </button>

        <button className="action-btn" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      {paymentStatus === "success" && (
        <p style={{ color: "green" }}>✅ Payment completed!</p>
      )}
      {paymentStatus === "failed" && (
        <p style={{ color: "red" }}>❌ Payment failed.</p>
      )}
    </div>
  );
};

export default Checkout;
