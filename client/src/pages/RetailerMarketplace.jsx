import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Marketplace.css";

const RetailerMarketplace = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null); // ✅ added
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const loggedInUserId = storedUser.userId || null;

  useEffect(() => {
    const fetchRetailerProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/retailer-products");
        setProducts(res.data);
      } catch (error) {
        console.error("Error fetching retailer products:", error);
      }
    };
    fetchRetailerProducts();
  }, []);

  const openDetails = (p) => setSelectedProduct(p);
  const closeDetails = () => setSelectedProduct(null);

  const handleBuy = (product) => {
    navigate(`/checkout?productId=${product._id}`);
  };

  return (
    <div className="marketplace-page">
      <marquee
        behavior="scroll"
        direction="left"
        scrollamount="5"
        style={{ color: "black", padding: "5px", fontSize: "18px", fontWeight: "bold" }}
      >
        <h1> 🏪 Retailer Marketplace 🏪 </h1>
      </marquee>

      <div className="crops-grid">
        {products.map((item) => (
          <div key={item._id} className="crop-grid-item">
            <img
              src={
                item.productImage
                  ? `http://localhost:5000/uploads/licenses/${item.productImage}`
                  : "https://via.placeholder.com/300x200?text=No+Image"
              }
              alt={item.variety}
            />

            <div className="crop-grid-details">
              <strong>{item.variety || 0}</strong>
              <p>Price: ₹ {item.sellingPrice} /kg</p>
              <p>Distributor: {item.buyerName || "Anonymous"}</p>
              <p>Available Quantity: {item.quantity} kg</p>

              <div className="card-buttons">
                <button className="action-btn" onClick={() => openDetails(item)}>Get Details</button> {/* ✅ fixed */}
                <button
                  className="action-btn buy-btn"
                  onClick={() => {
                    if (!loggedInUserId) {
                      alert("Please login to buy this product.");
                      navigate("/login");
                    } else {
                      handleBuy(item);
                    }
                  }}
                >
                  Buy
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Details modal */}
      {selectedProduct && (
        <div className="modal-backdrop" onClick={closeDetails}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeDetails}>✕</button>
            <div className="admin-modal-info">
              <h2>{selectedProduct.variety}</h2>
              <img
                src={
                  selectedProduct.productImage
                    ? `http://localhost:5000/uploads/licenses/${selectedProduct.productImage}`
                    : "https://via.placeholder.com/300x200?text=No+Image"
                }
                alt={selectedProduct.variety}
                style={{ width: "100%", maxHeight: "200px", objectFit: "cover", marginBottom: "10px" }}
              />
              <p><strong>Distributor:</strong> {selectedProduct.buyerName || 'Unknown'}</p>
              <p><strong>Quantity:</strong> {selectedProduct.quantity} kg</p>
              <p><strong>Product Form:</strong> {selectedProduct.productForm}</p>
              <p><strong>Cleaning:</strong> {selectedProduct.cleaning}</p>
              <p><strong>Stone Removal:</strong> {selectedProduct.stoneRemoval}</p>
              <p><strong>Milling Required:</strong> {selectedProduct.millingRequired}</p>

              <h4>Pricing & Costs</h4>
              <p><strong>Purchase Price:</strong> ₹ {selectedProduct.purchasePrice}</p>
              <p><strong>Selling Price:</strong> ₹ {selectedProduct.sellingPrice}</p>
              <p><strong>Transport Cost:</strong> ₹ {selectedProduct.transportCost}</p>
              <p><strong>Loading Cost:</strong> ₹ {selectedProduct.loadingCost}</p>
              <p><strong>Storage Cost:</strong> ₹ {selectedProduct.storageCost}</p>
              <p><strong>Processing Cost:</strong> ₹ {selectedProduct.processingCost}</p>
              <p><strong>Other Cost:</strong> ₹ {selectedProduct.otherCost}</p>
              <p><strong>Profit:</strong> ₹ {selectedProduct.profit}</p>

              <h4>Status & Meta</h4>
              <p><strong>Status:</strong> {selectedProduct.status}</p>
              <p><strong>Created:</strong> {selectedProduct.createdAt ? new Date(selectedProduct.createdAt).toLocaleString() : 'N/A'}</p>
              <p><strong>Updated:</strong> {selectedProduct.updatedAt ? new Date(selectedProduct.updatedAt).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetailerMarketplace;