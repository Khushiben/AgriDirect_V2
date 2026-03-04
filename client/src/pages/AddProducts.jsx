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
    transportCost: "",
    loadingCost: "",
    storageCost: "",
    processingCost: "",
    otherCost: "",
    purchasePrice: purchase?.pricePerKg || "",
    sellingPrice: "",
    quantity: purchase?.quantity || "",
    productImage: null,
  });

  const [profit, setProfit] = useState(0);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "productImage") {
      setFormData({ ...formData, productImage: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Auto Profit Calculation
  useEffect(() => {
    const totalCost =
      Number(formData.purchasePrice) +
      Number(formData.transportCost) +
      Number(formData.loadingCost) +
      Number(formData.storageCost) +
      Number(formData.processingCost) +
      Number(formData.otherCost);

    const totalSelling = Number(formData.sellingPrice);

    setProfit(totalSelling - totalCost);
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("productForm", formData.productForm);
      data.append("cleaning", formData.cleaning);
      data.append("stoneRemoval", formData.stoneRemoval);
      data.append("millingRequired", formData.millingRequired);
      data.append("transportCost", formData.transportCost);
      data.append("loadingCost", formData.loadingCost);
      data.append("storageCost", formData.storageCost);
      data.append("processingCost", formData.processingCost);
      data.append("otherCost", formData.otherCost);
      data.append("purchasePrice", formData.purchasePrice);
      data.append("sellingPrice", formData.sellingPrice);
      data.append("quantity", formData.quantity);
      data.append("profit", profit);
      data.append("variety", purchase.variety);
      data.append("productId", purchase.product?._id || purchase.product);

      if (formData.productImage)
        data.append("productImage", formData.productImage);

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

      alert("Distributor Product Added Successfully!");
      navigate("/distributor/dashboard");
    } catch (err) {
      console.log(err);
      alert("Error adding distributor product");
    }
  };
  
  if (!purchase) {
    return (
      <p style={{ textAlign: "center", color: "red" }}>
        No product selected!
      </p>
    );
  }

  return (
    <div className="add-product-container">
      <form className="full-page-form" onSubmit={handleSubmit}>
        <h1 style={{ textAlign: "center", color: "green" }}>
          -: Distributor Product Processing :-
        </h1>

        <h2>Product: {purchase.variety}</h2>
        <p>Available Quantity: {purchase.quantity} kg</p>
        <p>Purchase Price: ₹ {purchase.pricePerKg} / kg</p>

        {purchase.product?.image && (
          <img
            src={`http://localhost:5000/uploads/licenses/${purchase.product.image}`}
            alt={purchase.variety}
            style={{ width: "200px", margin: "10px 0" }}
          />
        )}

        <label>Product Form</label>
        <select name="productForm" onChange={handleChange} required>
          <option value="">Select</option>
          <option value="Paddy">Paddy (With Husk)</option>
          <option value="Milled">Milled Rice (Without Husk)</option>
        </select>

        {formData.productForm === "Paddy" && (
          <>
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
          </>
        )}

        <h2>Logistics & Processing Costs</h2>

        Purchase Price:
        <input
          type="number"
          name="purchasePrice"
          value={formData.purchasePrice}
          onChange={handleChange}
          required
        />

        Transport Cost:
        <input type="number" name="transportCost" onChange={handleChange} />

        Loading/Unloading Cost:
        <input type="number" name="loadingCost" onChange={handleChange} />

        Storage Cost:
        <input type="number" name="storageCost" onChange={handleChange} />

        Processing Cost:
        <input type="number" name="processingCost" onChange={handleChange} />

        Other Cost:
        <input type="number" name="otherCost" onChange={handleChange} />

        Selling Price:
        <input
          type="number"
          name="sellingPrice"
          min={minPrice}
          max={maxPrice}
          onChange={handleChange}
          required
        />

        <p>
          Selling price must be between ₹{minPrice} and ₹{maxPrice}
        </p>

        <label>Upload Product Photo</label>
        <input
          type="file"
          name="productImage"
          accept="image/*"
          onChange={handleChange}
        />

        <h3 style={{ color: profit >= 0 ? "green" : "red" }}>
          Estimated Profit: ₹ {profit}
        </h3>

        <button type="submit" className="submit-btn">
          Submit Distributor Entry
        </button>
      </form>
    </div>
  );
}