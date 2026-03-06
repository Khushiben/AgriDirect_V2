import React, { useState } from 'react';
import '../styles/ProductTraceability.css';

const ProductTraceability = ({ productData, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const calculatePriceBreakdown = () => {
    const farmerPrice = productData.farmer?.originalPrice || 0;
    const distributorPrice = productData.distributor?.sellingPrice || 0;
    const retailerPrice = productData.retailer?.finalPrice || productData.product?.totalPrice || 0;
    
    const distributorMargin = distributorPrice - farmerPrice;
    const retailerMargin = retailerPrice - distributorPrice;
    const totalMargin = retailerPrice - farmerPrice;

    return {
      farmerPrice,
      distributorPrice,
      retailerPrice,
      distributorMargin,
      retailerMargin,
      totalMargin
    };
  };

  const priceBreakdown = calculatePriceBreakdown();

  return (
    <div className="traceability-overlay">
      <div className="traceability-modal">
        <div className="traceability-header">
          <div className="header-content">
            <h2>🔍 Product Traceability</h2>
            <p className="subtitle">Complete journey from farm to table</p>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="traceability-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`tab ${activeTab === 'supply-chain' ? 'active' : ''}`}
            onClick={() => setActiveTab('supply-chain')}
          >
            🚚 Supply Chain
          </button>
          <button 
            className={`tab ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => setActiveTab('pricing')}
          >
            💰 Pricing
          </button>
          <button 
            className={`tab ${activeTab === 'blockchain' ? 'active' : ''}`}
            onClick={() => setActiveTab('blockchain')}
          >
            ⛓️ Blockchain
          </button>
        </div>

        <div className="traceability-content">
          {activeTab === 'overview' && (
            <div className="tab-content overview-tab">
              <div className="product-overview">
                <div className="product-image">
                  {productData.product?.image && (
                    <img src={productData.product.image} alt={productData.product.name} />
                  )}
                </div>
                <div className="product-info">
                  <h3>{productData.product?.name}</h3>
                  <div className="product-details">
                    <p><strong>Quantity:</strong> {productData.product?.quantity} kg</p>
                    <p><strong>Total Price:</strong> ₹{productData.product?.totalPrice}</p>
                    <p><strong>Purchase Date:</strong> {new Date(productData.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="quick-stats">
                <div className="stat-card">
                  <div className="stat-icon">👨‍🌾</div>
                  <div className="stat-info">
                    <h4>Farmer</h4>
                    <p>{productData.farmer?.name}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🚚</div>
                  <div className="stat-info">
                    <h4>Distributor</h4>
                    <p>{productData.distributor?.name}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🏪</div>
                  <div className="stat-info">
                    <h4>Retailer</h4>
                    <p>{productData.retailer?.name}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'supply-chain' && (
            <div className="tab-content supply-chain-tab">
              <div className="supply-chain-timeline">
                <div className="timeline-item">
                  <div className="timeline-icon farm">🌾</div>
                  <div className="timeline-content">
                    <h4>Farm Production</h4>
                    <p><strong>Farmer:</strong> {productData.farmer?.name}</p>
                    <p><strong>Original Price:</strong> ₹{priceBreakdown.farmerPrice}/kg</p>
                    <p><strong>Quality:</strong> Premium Grade</p>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-icon distributor">🚚</div>
                  <div className="timeline-content">
                    <h4>Distribution</h4>
                    <p><strong>Distributor:</strong> {productData.distributor?.name}</p>
                    <p><strong>Selling Price:</strong> ₹{priceBreakdown.distributorPrice}/kg</p>
                    <p><strong>Added Margin:</strong> ₹{priceBreakdown.distributorMargin}/kg</p>
                    <p><strong>Transport:</strong> Temperature Controlled</p>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-icon retailer">🏪</div>
                  <div className="timeline-content">
                    <h4>Retail Sale</h4>
                    <p><strong>Retailer:</strong> {productData.retailer?.name}</p>
                    <p><strong>Final Price:</strong> ₹{priceBreakdown.retailerPrice}/kg</p>
                    <p><strong>Added Margin:</strong> ₹{priceBreakdown.retailerMargin}/kg</p>
                    <p><strong>Storage:</strong> Fresh Produce Section</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="tab-content pricing-tab">
              <div className="price-breakdown">
                <h3>💰 Price Breakdown</h3>
                
                <div className="price-item">
                  <div className="price-label">
                    <span className="icon">👨‍🌾</span>
                    <span>Farmer's Price</span>
                  </div>
                  <div className="price-value">₹{priceBreakdown.farmerPrice}/kg</div>
                </div>

                <div className="price-item">
                  <div className="price-label">
                    <span className="icon">🚚</span>
                    <span>Distributor's Margin</span>
                  </div>
                  <div className="price-value">+₹{priceBreakdown.distributorMargin}/kg</div>
                </div>

                <div className="price-item">
                  <div className="price-label">
                    <span className="icon">🏪</span>
                    <span>Retailer's Margin</span>
                  </div>
                  <div className="price-value">+₹{priceBreakdown.retailerMargin}/kg</div>
                </div>

                <div className="price-divider"></div>

                <div className="price-item total">
                  <div className="price-label">
                    <span className="icon">💰</span>
                    <strong>Final Consumer Price</strong>
                  </div>
                  <div className="price-value">₹{priceBreakdown.retailerPrice}/kg</div>
                </div>

                <div className="price-summary">
                  <div className="summary-item">
                    <span>Total Margin:</span>
                    <span>₹{priceBreakdown.totalMargin}/kg</span>
                  </div>
                  <div className="summary-item">
                    <span>Farmer's Share:</span>
                    <span>{Math.round((priceBreakdown.farmerPrice / priceBreakdown.retailerPrice) * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'blockchain' && (
            <div className="tab-content blockchain-tab">
              <div className="blockchain-info">
                <h3>⛓️ Blockchain Verification</h3>
                
                <div className="verification-status">
                  <div className={`status-badge ${productData.blockchain?.verified ? 'verified' : 'processing'}`}>
                    {productData.blockchain?.verified ? '✅ Verified' : '⏳ Processing'}
                  </div>
                </div>

                <div className="blockchain-details">
                  <div className="detail-row">
                    <span>Transaction ID:</span>
                    <code>{productData.transactionId}</code>
                  </div>
                  
                  <div className="detail-row">
                    <span>Blockchain Hash:</span>
                    <code>{productData.blockchain?.txHash || 'Processing...'}</code>
                  </div>

                  <div className="detail-row">
                    <span>Timestamp:</span>
                    <span>{new Date(productData.timestamp).toLocaleString()}</span>
                  </div>

                  <div className="detail-row">
                    <span>QR Generated:</span>
                    <span>{new Date(productData.qrGenerated).toLocaleString()}</span>
                  </div>
                </div>

                <div className="blockchain-benefits">
                  <h4>🔒 Security Features</h4>
                  <ul>
                    <li>Immutable transaction records</li>
                    <li>Complete supply chain transparency</li>
                    <li>Tamper-proof product information</li>
                    <li>Real-time verification</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="traceability-footer">
          <div className="verification-badge">
            <span className="badge-icon">✓</span>
            <span>Verified Authentic Product</span>
          </div>
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductTraceability;
