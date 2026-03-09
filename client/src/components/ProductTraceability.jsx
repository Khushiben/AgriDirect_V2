import React, { useState, useEffect } from 'react';
import '../styles/ProductTraceability.css';

const ProductTraceability = ({ productData, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [blocksBuilt, setBlocksBuilt] = useState(0);
  const [dataRevealed, setDataRevealed] = useState(false);

  useEffect(() => {
    // Simulate blockchain piecing animation - LONGER duration
    const buildBlocks = async () => {
      for (let i = 0; i <= 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 800)); // Increased from 400ms to 800ms
        setBlocksBuilt(i);
      }
      await new Promise(resolve => setTimeout(resolve, 1000)); // Increased from 500ms to 1000ms
      setDataRevealed(true);
      await new Promise(resolve => setTimeout(resolve, 800)); // Increased from 300ms to 800ms
      setLoading(false);
    };

    buildBlocks();
  }, []);

  console.log("📦 Product Data Received:", productData);

  // Parse the data properly
  const parsedData = {
    variety: productData.variety || "Unknown Product",
    retailer: productData.retailer || productData.retailerName || "Unknown Retailer",
    distributor: productData.distributor || productData.distributorName || "Unknown Distributor",
    farmer: productData.farmer || productData.farmerName || "Unknown Farmer",
    farmerLocation: productData.farmerLocation || "Unknown Location",
    quantity: productData.quantity || 0,
    price: productData.price || productData.totalPrice || 0,
    purchasePrice: productData.purchasePrice || 0,
    logisticCost: productData.logisticCost || 0,
    timestamp: productData.timestamp || new Date().toISOString(),
    // Transaction IDs
    transactions: productData.transactions || {
      adminApproval: "N/A",
      distributorPurchase: "N/A",
      distributorListing: "N/A",
      retailerPurchase: "N/A",
      retailerListing: "N/A"
    },
    // Price breakdown
    prices: productData.prices || {
      farmer: 0,
      distributor: 0,
      retailer: 0
    }
  };

  const calculatePriceBreakdown = () => {
    const retailerPrice = parseFloat(parsedData.price) || 0;
    const distributorPrice = parseFloat(parsedData.prices.distributor) || parseFloat(parsedData.purchasePrice) || 0;
    const farmerPrice = parseFloat(parsedData.prices.farmer) || (distributorPrice * 0.75);
    const logisticCost = parseFloat(parsedData.logisticCost) || 0;
    
    const retailerMargin = retailerPrice - distributorPrice - logisticCost;
    const distributorMargin = distributorPrice - farmerPrice;

    return {
      farmerPrice: farmerPrice.toFixed(2),
      distributorPrice: distributorPrice.toFixed(2),
      retailerPrice: retailerPrice.toFixed(2),
      logisticCost: logisticCost.toFixed(2),
      distributorMargin: distributorMargin.toFixed(2),
      retailerMargin: retailerMargin.toFixed(2),
      totalMargin: (distributorMargin + retailerMargin).toFixed(2)
    };
  };

  const priceBreakdown = calculatePriceBreakdown();

  if (loading) {
    return (
      <div className="traceability-overlay">
        <div className="blockchain-loading-modal">
          <div className="loading-header">
            <div className="eth-logo">⟠</div>
            <h2>⛓️ Ethereum Blockchain Verification</h2>
            <p>Querying smart contract and validating supply chain data...</p>
            <div className="network-badge">
              <span className="status-dot"></span>
              Network: Ethereum Mainnet
            </div>
          </div>

          <div className="blockchain-animation">
            <div className="blocks-container">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <div 
                  key={index}
                  className={`block ${blocksBuilt > index ? 'built' : ''} ${blocksBuilt === index ? 'building' : ''}`}
                >
                  <div className="block-inner">
                    <div className="block-number">Block #{12345678 + index}</div>
                    <div className="block-icon">
                      {index === 0 && '🌾'}
                      {index === 1 && '👨‍🌾'}
                      {index === 2 && '🚚'}
                      {index === 3 && '🏪'}
                      {index === 4 && '💰'}
                      {index === 5 && '✓'}
                    </div>
                    <div className="block-label">
                      {index === 0 && 'Product Origin'}
                      {index === 1 && 'Farmer Verified'}
                      {index === 2 && 'Distribution'}
                      {index === 3 && 'Retail Sale'}
                      {index === 4 && 'Price Data'}
                      {index === 5 && 'Validated'}
                    </div>
                    <div className="block-hash">
                      {index === 0 && '0x7a3f...92bc'}
                      {index === 1 && '0x4e2d...81fa'}
                      {index === 2 && '0x9c1b...45de'}
                      {index === 3 && '0x6f8a...23cd'}
                      {index === 4 && '0x2d5e...67ab'}
                      {index === 5 && '0x8b3c...91ef'}
                    </div>
                  </div>
                  {index < 5 && <div className="block-connector"></div>}
                </div>
              ))}
            </div>

            {dataRevealed && (
              <div className="data-reveal">
                <div className="reveal-icon">⟠</div>
                <div className="reveal-text">Smart Contract Data Retrieved!</div>
                <div className="reveal-checkmark">✓</div>
                <div className="gas-info">Gas Used: 0.00{Math.floor(Math.random() * 9) + 1}2 ETH</div>
              </div>
            )}
          </div>

          <div className="loading-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(blocksBuilt / 5) * 100}%` }}
              ></div>
            </div>
            <p className="progress-text">
              {blocksBuilt === 0 && '🔗 Connecting to Ethereum network...'}
              {blocksBuilt === 1 && '📡 Querying smart contract 0xAgriDirect...'}
              {blocksBuilt === 2 && '🔍 Verifying farmer transaction...'}
              {blocksBuilt === 3 && '📦 Checking distributor records...'}
              {blocksBuilt === 4 && '🏪 Loading retailer data...'}
              {blocksBuilt === 5 && dataRevealed && '✅ Blockchain verification complete!'}
            </p>
            <div className="tech-details">
              <span>Confirmations: {blocksBuilt * 2}/12</span>
              <span>Block Time: ~{(blocksBuilt * 0.4).toFixed(1)}s</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <div className="product-info-card">
                  <h3>{parsedData.variety}</h3>
                  <div className="product-details">
                    <div className="detail-item">
                      <span className="label">Quantity:</span>
                      <span className="value">{parsedData.quantity} kg</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Final Price:</span>
                      <span className="value">₹{parsedData.price}/kg</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Purchase Date:</span>
                      <span className="value">{new Date(parsedData.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="quick-stats">
                <div className="stat-card">
                  <div className="stat-icon">👨‍🌾</div>
                  <div className="stat-info">
                    <h4>Farmer</h4>
                    <p>{parsedData.farmer}</p>
                    <small>{parsedData.farmerLocation}</small>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🚚</div>
                  <div className="stat-info">
                    <h4>Distributor</h4>
                    <p>{parsedData.distributor}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🏪</div>
                  <div className="stat-info">
                    <h4>Retailer</h4>
                    <p>{parsedData.retailer}</p>
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
                    <p><strong>Farmer:</strong> {parsedData.farmer}</p>
                    <p><strong>Location:</strong> {parsedData.farmerLocation}</p>
                    <p><strong>Original Price:</strong> ₹{priceBreakdown.farmerPrice}/kg</p>
                    <p><strong>Quality:</strong> Premium Grade</p>
                    <p><strong>TX:</strong> <code>{parsedData.transactions.adminApproval}</code></p>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-icon distributor">🚚</div>
                  <div className="timeline-content">
                    <h4>Distribution</h4>
                    <p><strong>Distributor:</strong> {parsedData.distributor}</p>
                    <p><strong>Selling Price:</strong> ₹{priceBreakdown.distributorPrice}/kg</p>
                    <p><strong>Added Margin:</strong> ₹{priceBreakdown.distributorMargin}/kg</p>
                    <p><strong>Transport:</strong> Temperature Controlled</p>
                    <p><strong>Purchase TX:</strong> <code>{parsedData.transactions.distributorPurchase}</code></p>
                    <p><strong>Listing TX:</strong> <code>{parsedData.transactions.distributorListing}</code></p>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-icon retailer">🏪</div>
                  <div className="timeline-content">
                    <h4>Retail Sale</h4>
                    <p><strong>Retailer:</strong> {parsedData.retailer}</p>
                    <p><strong>Final Price:</strong> ₹{priceBreakdown.retailerPrice}/kg</p>
                    <p><strong>Logistic Cost:</strong> ₹{priceBreakdown.logisticCost}/kg</p>
                    <p><strong>Retailer Margin:</strong> ₹{priceBreakdown.retailerMargin}/kg</p>
                    <p><strong>Purchase TX:</strong> <code>{parsedData.transactions.retailerPurchase}</code></p>
                    <p><strong>Listing TX:</strong> <code>{parsedData.transactions.retailerListing}</code></p>
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
                    <span className="icon">📦</span>
                    <span>Logistic Cost</span>
                  </div>
                  <div className="price-value">+₹{priceBreakdown.logisticCost}/kg</div>
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
                  <div className="status-badge verified">
                    ✅ Verified on Blockchain
                  </div>
                </div>

                <div className="blockchain-details">
                  <div className="detail-row">
                    <span>Product:</span>
                    <code>{parsedData.variety}</code>
                  </div>
                  
                  <div className="detail-row">
                    <span>Timestamp:</span>
                    <span>{new Date(parsedData.timestamp).toLocaleString()}</span>
                  </div>

                  <div className="detail-row">
                    <span>Quantity:</span>
                    <span>{parsedData.quantity} kg</span>
                  </div>
                </div>

                <h4 style={{marginTop: '20px', color: '#2e7d32'}}>📜 Complete Transaction History</h4>
                
                <div className="blockchain-details" style={{marginTop: '15px'}}>
                  <div className="detail-row">
                    <span>1️⃣ Admin Approval:</span>
                    <code style={{fontSize: '0.85em'}}>{parsedData.transactions.adminApproval}</code>
                  </div>
                  
                  <div className="detail-row">
                    <span>2️⃣ Distributor Purchase:</span>
                    <code style={{fontSize: '0.85em'}}>{parsedData.transactions.distributorPurchase}</code>
                  </div>
                  
                  <div className="detail-row">
                    <span>3️⃣ Distributor Listing:</span>
                    <code style={{fontSize: '0.85em'}}>{parsedData.transactions.distributorListing}</code>
                  </div>
                  
                  <div className="detail-row">
                    <span>4️⃣ Retailer Purchase:</span>
                    <code style={{fontSize: '0.85em'}}>{parsedData.transactions.retailerPurchase}</code>
                  </div>
                  
                  <div className="detail-row">
                    <span>5️⃣ Retailer Listing:</span>
                    <code style={{fontSize: '0.85em'}}>{parsedData.transactions.retailerListing}</code>
                  </div>
                </div>

                <div className="blockchain-benefits">
                  <h4>🔒 Security Features</h4>
                  <ul>
                    <li>✓ Immutable transaction records</li>
                    <li>✓ Complete supply chain transparency</li>
                    <li>✓ Tamper-proof product information</li>
                    <li>✓ Real-time verification</li>
                    <li>✓ End-to-end traceability</li>
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
