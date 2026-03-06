import React, { useState, useEffect } from "react";
import axios from "axios";
import QRCode from "qrcode";
import "../styles/RetailerTransactions.css";

const RetailerTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/retailer-purchases/my-purchases", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(res.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (transaction) => {
    try {
      // Generate QR data with complete product traceability info
      const qrData = {
        transactionId: transaction._id,
        product: {
          name: transaction.variety,
          image: transaction.productImage,
          quantity: transaction.quantity,
          pricePerKg: transaction.pricePerKg,
          totalPrice: transaction.totalPrice
        },
        farmer: {
          name: transaction.farmerName || "Unknown Farmer",
          originalPrice: transaction.originalPrice || 0
        },
        distributor: {
          name: transaction.distributorName || "Unknown Distributor",
          addedTax: transaction.distributorTax || 0,
          sellingPrice: transaction.pricePerKg
        },
        retailer: {
          name: transaction.retailerName || "Unknown Retailer",
          addedTax: transaction.retailerTax || 0,
          finalPrice: transaction.totalPrice
        },
        blockchain: {
          txHash: transaction.blockchainTxHash || "Processing...",
          verified: !!transaction.blockchainTxHash
        },
        timestamp: transaction.createdAt,
        qrGenerated: new Date().toISOString()
      };

      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2,
        color: {
          dark: "#1a1a1a",
          light: "#ffffff"
        }
      });

      setQrCode(qrCodeDataUrl);
      setSelectedTransaction(transaction);
    } catch (error) {
      console.error("Error generating QR code:", error);
      alert("Failed to generate QR code");
    }
  };

  const downloadQRCode = () => {
    if (!qrCode || !selectedTransaction) return;

    const link = document.createElement("a");
    link.download = `QR_${selectedTransaction.variety}_${selectedTransaction._id}.png`;
    link.href = qrCode;
    link.click();
  };

  if (loading) {
    return (
      <div className="retailer-transactions">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="retailer-transactions">
      <h1>🛒 My Purchase Transactions</h1>
      
      {transactions.length === 0 ? (
        <div className="no-transactions">
          <p>No purchase transactions found.</p>
        </div>
      ) : (
        <div className="transactions-grid">
          {transactions.map((transaction) => (
            <div key={transaction._id} className="transaction-card">
              <div className="transaction-header">
                <h3>{transaction.variety}</h3>
                <span className="transaction-date">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="transaction-details">
                <div className="detail-row">
                  <span>Quantity:</span>
                  <span>{transaction.quantity} kg</span>
                </div>
                <div className="detail-row">
                  <span>Price/kg:</span>
                  <span>₹{transaction.pricePerKg}</span>
                </div>
                <div className="detail-row">
                  <span>Total:</span>
                  <span className="total-price">₹{transaction.totalPrice}</span>
                </div>
                <div className="detail-row">
                  <span>Distributor:</span>
                  <span>{transaction.distributorName}</span>
                </div>
              </div>

              <div className="transaction-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  📋 Get Details
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => generateQRCode(transaction)}
                >
                  📱 Get QR Code
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && !qrCode && (
        <div className="modal-overlay" onClick={() => setSelectedTransaction(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Transaction Details</h2>
              <button className="close-btn" onClick={() => setSelectedTransaction(null)}>×</button>
            </div>
            
            <div className="transaction-full-details">
              <div className="detail-section">
                <h3>📦 Product Information</h3>
                <p><strong>Variety:</strong> {selectedTransaction.variety}</p>
                <p><strong>Quantity:</strong> {selectedTransaction.quantity} kg</p>
                <p><strong>Price per kg:</strong> ₹{selectedTransaction.pricePerKg}</p>
                <p><strong>Total Price:</strong> ₹{selectedTransaction.totalPrice}</p>
              </div>

              <div className="detail-section">
                <h3>👨‍🌾 Supply Chain</h3>
                <p><strong>Farmer:</strong> {selectedTransaction.farmerName || "Unknown"}</p>
                <p><strong>Distributor:</strong> {selectedTransaction.distributorName}</p>
                <p><strong>Retailer:</strong> {selectedTransaction.retailerName}</p>
              </div>

              <div className="detail-section">
                <h3>⛓️ Blockchain</h3>
                <p><strong>Transaction Hash:</strong> 
                  <code>{selectedTransaction.blockchainTxHash || "Processing..."}</code>
                </p>
                <p><strong>Status:</strong> 
                  <span className={selectedTransaction.blockchainTxHash ? "verified" : "processing"}>
                    {selectedTransaction.blockchainTxHash ? "✅ Verified" : "⏳ Processing"}
                  </span>
                </p>
              </div>

              <div className="detail-section">
                <h3>📅 Timestamp</h3>
                <p>{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-primary"
                onClick={() => generateQRCode(selectedTransaction)}
              >
                📱 Generate QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrCode && selectedTransaction && (
        <div className="modal-overlay" onClick={() => {setQrCode(""); setSelectedTransaction(null);}}>
          <div className="modal-content qr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📱 Product QR Code</h2>
              <button className="close-btn" onClick={() => {setQrCode(""); setSelectedTransaction(null);}}>×</button>
            </div>
            
            <div className="qr-container">
              <div className="qr-code">
                <img src={qrCode} alt="QR Code" />
              </div>
              <div className="qr-info">
                <h3>{selectedTransaction.variety}</h3>
                <p>Quantity: {selectedTransaction.quantity} kg</p>
                <p>Total: ₹{selectedTransaction.totalPrice}</p>
                <p className="qr-note">Scan this QR code to verify product authenticity and trace its complete journey from farm to table.</p>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={downloadQRCode}>
                📥 Download QR Code
              </button>
              <button className="btn btn-secondary" onClick={() => {setQrCode(""); setSelectedTransaction(null);}}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetailerTransactions;
