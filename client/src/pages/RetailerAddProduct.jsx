import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/RetailerAddProduct.css"; // ✅ Import CSS

const RetailerAddProduct = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;

  const [price, setPrice] = useState("");
  const [logisticCost, setLogisticCost] = useState("");
  const [quantity, setQuantity] = useState(product?.quantity || 0);

  // ✅ Auto calculate total price per kg
  const totalPricePerKg = useMemo(() => {
    const p = Number(price) || 0;
    const l = Number(logisticCost) || 0;
    return p + l;
  }, [price, logisticCost]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/retailer-marketplace/add",
        {
          purchaseId: product._id,
          variety: product.variety,
          quantity,
          price,
          logisticCost,
          totalPrice: totalPricePerKg,
          productImage: product.productImage
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert("Product added to marketplace!");
      navigate("/marketplace");

    } catch (error) {
      console.error(error);
      alert("Failed to add product");
    }
  };

  if (!product) return <p>No product selected</p>;

  return (
    <div className="retailer-add-container">
      <h2>Add {product.variety} to Marketplace</h2>

      <form onSubmit={handleSubmit} className="retailer-add-form">
        <p>Available Quantity: {product.quantity} kg</p>
        <p>Price per kg: ₹ {product.pricePerKg}</p>

        <label>Selling price per kg</label>
        <input
          type="number"
          placeholder="Enter selling price per kg"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <label>Logistic cost per kg</label>
        <input
          type="number"
          placeholder="Enter logistic cost per kg"
          value={logisticCost}
          onChange={(e) => setLogisticCost(e.target.value)}
          required
        />

        <label>Quantity to sell</label>
        <input
          type="number"
          placeholder="Enter quantity to sell"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />

        <div className="total-price-box">
          Total Price per Kg: ₹ {totalPricePerKg}
        </div>

        <button type="submit">
          Add Product
        </button>
      </form>
    </div>
  );
};

export default RetailerAddProduct;