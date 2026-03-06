import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import QRScanner from "../components/QRScanner";
import ProductTraceability from "../components/ProductTraceability";
import "../styles/Marketplace.css";
import "../styles/QRScannerButton.css";

const ConsumerMarketplace = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showTraceability, setShowTraceability] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const loggedInUserId = storedUser.userId || null;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/retailer-marketplace")
        setProducts(res.data);
      } catch (error) {
        console.error("Error fetching retailer marketplace products:", error);
      }
    };

    fetchProducts();
  }, []);

  const openDetails = (product) => setSelectedProduct(product);
  const closeDetails = () => setSelectedProduct(null);

  const handleBuy = (product) => {
    navigate(`/checkout?productId=${product._id}`);
  };

  const handleQRScanSuccess = (productData) => {
    setScannedProduct(productData);
    setShowQRScanner(false);
    setShowTraceability(true);
  };

  const closeQRScanner = () => {
    setShowQRScanner(false);
  };

  const closeTraceability = () => {
    setShowTraceability(false);
    setScannedProduct(null);
  };

  return (
    <div className="marketplace-page">
      {/* QR Scanner Button */}
      <div className="qr-scanner-section">
        <button 
          className="qr-scanner-btn"
          onClick={() => setShowQRScanner(true)}
        >
          📱 Scan QR Code
        </button>
        <p className="qr-scanner-hint">
          Scan product QR codes to verify authenticity and trace origin
        </p>
      </div>

      <marquee
        behavior="scroll"
        direction="left"
        scrollamount="5"
        style={{
          color: "black",
          padding: "5px",
          fontSize: "18px",
          fontWeight: "bold"
        }}
      >
        <h1> 🛒 Consumer Marketplace 🛒 </h1>
      </marquee>

      <div className="crops-grid">
        {products
          .filter((item) => item.status === "available" && item.quantity > 0)
          .map((item) => (
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
                <strong>{item.variety}</strong>

                <p>Price: ₹ {item.totalPrice} / kg</p>
                <p>Retailer: {item.retailerName}</p>
                <p>Available Quantity: {item.quantity} kg</p>

                <div className="card-buttons">
                  <button
                    className="action-btn"
                    onClick={() => openDetails(item)}
                  >
                    Get Details
                  </button>

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

      {/* Details Modal */}
      {selectedProduct && (
        <div className="modal-backdrop" onClick={closeDetails}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeDetails}>
              ✕
            </button>

            <div className="admin-modal-info">
              <h2>{selectedProduct.variety}</h2>

              <img
                src={
                  selectedProduct.productImage
                    ? `http://localhost:5000/uploads/licenses/${selectedProduct.productImage}`
                    : "https://via.placeholder.com/300x200?text=No+Image"
                }
                alt={selectedProduct.variety}
                style={{
                  width: "100%",
                  maxHeight: "200px",
                  objectFit: "cover",
                  marginBottom: "10px"
                }}
              />

              <h4>Product Details</h4>
              <p><strong>Retailer:</strong> {selectedProduct.retailerName}</p>
              <p><strong>Available Quantity:</strong> {selectedProduct.quantity} kg</p>

              <h4>Pricing</h4>
              <p><strong>Selling Price:</strong> ₹ {selectedProduct.price}</p>
              <p><strong>Logistic Cost:</strong> ₹ {selectedProduct.logisticCost}</p>
              <p><strong>Total Price per Kg:</strong> ₹ {selectedProduct.totalPrice}</p>

              <h4>Status & Meta</h4>
              <p><strong>Status:</strong> {selectedProduct.status}</p>
              <p>
                <strong>Created:</strong>{" "}
                {selectedProduct.createdAt ? new Date(selectedProduct.createdAt).toLocaleString() : 'N/A'}
              </p>
              <p>
                <strong>Updated:</strong>{" "}
                {selectedProduct.updatedAt
                  ? new Date(selectedProduct.updatedAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner 
          onScanSuccess={handleQRScanSuccess}
          onClose={closeQRScanner}
        />
      )}

      {/* Product Traceability Modal */}
      {showTraceability && scannedProduct && (
        <ProductTraceability 
          productData={scannedProduct}
          onClose={closeTraceability}
        />
      )}
    </div>
  );
};

export default ConsumerMarketplace;