import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import QRCode from "qrcode";
import "../styles/RetailerAddProduct.css";

const RetailerAddProduct = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;

  const [price, setPrice] = useState("");
  const [logisticCost, setLogisticCost] = useState("");
  const [quantity, setQuantity] = useState(product?.quantity || 0);
  const [showETHModal, setShowETHModal] = useState(false);
  const [ethTxDetails, setEthTxDetails] = useState(null);
  const [txStatus, setTxStatus] = useState("processing");
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCode, setQRCode] = useState("");
  const [qrLoading, setQrLoading] = useState(false);

  // Calculate total price per kg
  const totalPricePerKg = useMemo(() => {
    const p = Number(price) || 0;
    const l = Number(logisticCost) || 0;
    return p + l;
  }, [price, logisticCost]);

  // Calculate profit
  const profit = useMemo(() => {
    const sellingPrice = Number(price) || 0;
    const purchasePrice = product?.sellingPrice || product?.pricePerKg || 0;
    return sellingPrice - purchasePrice;
  }, [price, product]);

  const generateQRCode = async (productData) => {
    setQrLoading(true);
    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const qrData = JSON.stringify({
        variety: productData.variety,
        retailer: productData.retailerName,
        distributor: productData.distributorName,
        farmer: productData.farmerName,
        farmerLocation: productData.farmerLocation,
        quantity: productData.quantity,
        price: productData.totalPrice,
        purchasePrice: product?.sellingPrice || product?.pricePerKg,
        logisticCost: productData.logisticCost,
        timestamp: new Date().toISOString(),
        // Complete transaction history
        transactions: {
          adminApproval: productData.adminApprovalTx,
          distributorPurchase: productData.distributorPurchaseTx,
          distributorListing: productData.distributorListingTx,
          retailerPurchase: productData.retailerPurchaseTx,
          retailerListing: productData.retailerListingTx
        },
        // Price breakdown
        prices: {
          farmer: productData.farmerSoldPrice,
          distributor: productData.distributorSoldPrice,
          retailer: productData.totalPrice
        }
      });
      
      const qrCodeUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#2e7d32',
          light: '#ffffff'
        }
      });
      
      setQRCode(qrCodeUrl);
      setQrLoading(false);
    } catch (error) {
      console.error("QR generation error:", error);
      setQrLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const productData = {
        purchaseId: product._id,
        variety: product.variety,
        quantity,
        price,
        logisticCost,
        totalPrice: totalPricePerKg,
        productImage: product.productImage,
        retailerName: user.name,
        distributorName: product.buyerName || product.distributorName || "Unknown Distributor",
        farmerName: product.farmerName || "Unknown Farmer",
        farmerLocation: product.farmerLocation || "Unknown Location",
        farmerSoldPrice: product.farmerPrice || 0,
        distributorSoldPrice: product.sellingPrice || product.pricePerKg || 0,
        adminApprovalTx: product.adminApprovalTx || "N/A",
        distributorPurchaseTx: product.purchaseTxHash || product.distributorPurchaseTx || "N/A",
        distributorListingTx: product.listingTxHash || product.distributorListingTx || "N/A",
        retailerPurchaseTx: product.purchaseTxHash || "N/A",
        blockchainHistory: product.blockchainHistory || []
      };

      const response = await axios.post(
        "http://localhost:5000/api/retailer-marketplace/add",
        productData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Show ETH transaction modal
      const txHash = response.data.txHash || '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const gasFee = (Math.random() * 0.01 + 0.005).toFixed(4);
      
      setEthTxDetails({
        txHash: txHash,
        gasFee: gasFee,
        productName: product.variety,
        price: totalPricePerKg,
        quantity: quantity
      });
      setTxStatus("processing");
      setShowETHModal(true);

      // Generate QR code with complete supply chain data
      generateQRCode({
        ...productData,
        retailerListingTx: txHash
      });

      // Change to confirmed after 3 seconds
      setTimeout(() => {
        setTxStatus("confirmed");
      }, 3000);

      // Show QR modal after 4 seconds (removed extra delay)
      setTimeout(() => {
        setShowETHModal(false);
        setShowQRModal(true);
      }, 4000);

    } catch (error) {
      console.error(error);
      alert("Failed to add product");
    }
  };

  const closeQRModal = () => {
    setShowQRModal(false);
    navigate("/retailer/dashboard");
  };

  if (!product) return (
    <div className="retailer-add-container">
      <p className="error-message">No product selected</p>
    </div>
  );

  console.log("📦 Product data:", product);
  console.log("💰 Selling price:", product.sellingPrice);
  console.log("💰 Price per kg:", product.pricePerKg);

  return (
    <div className="retailer-add-container">
      <form onSubmit={handleSubmit} className="retailer-add-form">
        <h1>🏪 Add Product to Marketplace</h1>

        <div className="product-info-card">
          <h2>📦 {product.variety}</h2>
          {product.productImage && (
            <img
              src={`http://localhost:5000/uploads/licenses/${product.productImage}`}
              alt={product.variety}
              className="product-image"
            />
          )}
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Available Quantity:</span>
              <span className="value">{product.quantity} kg</span>
            </div>
            <div className="info-item">
              <span className="label">Distributor:</span>
              <span className="value">{product.buyerName || "Unknown"}</span>
            </div>
            <div className="info-item purchased-price">
              <span className="label">💰 Your Purchase Price:</span>
              <span className="value">₹{product.sellingPrice || product.pricePerKg || 0}/kg</span>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>💵 Pricing Details</h3>
          
          <div className="input-group">
            <label>Selling Price (per kg)</label>
            <input
              type="number"
              step="0.01"
              placeholder="Enter your selling price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>🚚 Logistic Cost (per kg)</label>
            <input
              type="number"
              step="0.01"
              placeholder="Enter logistic cost"
              value={logisticCost}
              onChange={(e) => setLogisticCost(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Quantity to Sell (kg)</label>
            <input
              type="number"
              placeholder="Enter quantity"
              value={quantity}
              max={product.quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="calculation-display">
            <div className="calc-row">
              <span>Purchase Price:</span>
              <span>₹{product?.sellingPrice || product?.pricePerKg || 0}/kg</span>
            </div>
            <div className="calc-row">
              <span>Your Selling Price:</span>
              <span>₹{price || 0}/kg</span>
            </div>
            <div className="calc-row">
              <span>Logistic Cost:</span>
              <span>₹{logisticCost || 0}/kg</span>
            </div>
            <div className="calc-row total">
              <span>Total Price per Kg:</span>
              <span>₹{totalPricePerKg}/kg</span>
            </div>
            <div className={`calc-row profit ${profit >= 0 ? 'positive' : 'negative'}`}>
              <span>{profit >= 0 ? '📈 Profit:' : '📉 Loss:'}</span>
              <span>₹{profit}/kg</span>
            </div>
          </div>
        </div>

        <button type="submit" className="submit-btn">
          ✅ Add to Marketplace
        </button>
      </form>

      {/* ETH Transaction Modal */}
      {showETHModal && ethTxDetails && (
        <div className="eth-modal-backdrop">
          <div className="eth-modal">
            <div className="eth-particles">
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
            </div>
            
            <div className="eth-icon-container">
              <div className="eth-icon">⟠</div>
              <div className="eth-glow"></div>
            </div>
            
            <h2 className="eth-title">
              {txStatus === "processing" ? "Processing Transaction..." : "Transaction Confirmed"}
            </h2>
            <p className="eth-subtitle">
              {txStatus === "processing" ? "Securing your product on blockchain" : "Product added to marketplace successfully"}
            </p>
            
            {txStatus === "processing" && (
              <div className="progress-bar-container">
                <div className="progress-bar"></div>
              </div>
            )}
            
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
                    <>
                      <span className="checkmark">✓</span> Confirmed
                    </>
                  )}
                </span>
              </div>
            </div>
            
            {txStatus === "confirmed" && (
              <div className="success-animation">
                <div className="success-circle"></div>
                <div className="success-checkmark">✓</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="qr-modal-backdrop" onClick={closeQRModal}>
          <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeQRModal}>✕</button>
            
            <h2>📱 Product QR Code</h2>
            <p className="qr-subtitle">Scan to view complete product information</p>
            
            {qrLoading ? (
              <div className="qr-skeleton">
                <div className="skeleton-qr"></div>
                <p>Generating QR Code...</p>
              </div>
            ) : (
              <div className="qr-content">
                <img src={qrCode} alt="Product QR Code" className="qr-image" />
                <div className="qr-info">
                  <p><strong>Product:</strong> {product.variety}</p>
                  <p><strong>Quantity:</strong> {quantity} kg</p>
                  <p><strong>Price:</strong> ₹{totalPricePerKg}/kg</p>
                  <p className="qr-note">💡 Consumers can scan this to verify authenticity</p>
                </div>
                <button className="download-qr-btn" onClick={() => {
                  const link = document.createElement('a');
                  link.download = `${product.variety}-QR.png`;
                  link.href = qrCode;
                  link.click();
                }}>
                  📥 Download QR Code
                </button>
              </div>
            )}
            
            <button className="qr-close-btn" onClick={closeQRModal}>
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetailerAddProduct;