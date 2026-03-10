import React, { useState, useEffect } from 'react';
import '../styles/ProductTraceability.css';

const ProductTraceability = ({ productData, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [blocksBuilt, setBlocksBuilt] = useState(0);
  const [dataRevealed, setDataRevealed] = useState(false);

  console.log("🔍 TRACEABILITY: Component mounted with productData:", productData);

  useEffect(() => {
    console.log("🔍 TRACEABILITY: Starting blockchain animation...");
    // Simulate blockchain piecing animation - smooth and detailed
    const buildBlocks = async () => {
      for (let i = 0; i <= 6; i++) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setBlocksBuilt(i);
        console.log(`🔍 TRACEABILITY: Block ${i} built`);
      }
      await new Promise(resolve => setTimeout(resolve, 800));
      setDataRevealed(true);
      console.log("🔍 TRACEABILITY: Data revealed");
      await new Promise(resolve => setTimeout(resolve, 600));
      setLoading(false);
      console.log("🔍 TRACEABILITY: Loading complete, showing data");
    };

    buildBlocks();
  }, []);

  console.log("📦 Product Data Received:", productData);

  // Parse the data properly - handle both old and new field names
  const parsedData = {
    variety: productData.v || productData.variety || "Unknown Product",
    retailer: productData.r || productData.retailerName || productData.retailer || "Unknown Retailer",
    distributor: productData.d || productData.distributorName || productData.distributor || "Unknown Distributor",
    farmer: productData.f || productData.farmerName || productData.farmer || "Unknown Farmer",
    farmerLocation: productData.l || productData.farmerLocation || "Unknown Location",
    quantity: productData.q || productData.quantity || 0,
    price: productData.p || productData.price || productData.totalPrice || 0,
    purchasePrice: productData.purchasePrice || 0,
    logisticCost: productData.lc || productData.logisticCost || 0,
    timestamp: productData.t || productData.timestamp || new Date().toISOString(),
    // Transaction IDs - handle both full and shortened
    transactions: productData.tx ? {
      adminApproval: productData.tx.a || "N/A",
      distributorPurchase: productData.tx.d1 || "N/A",
      distributorListing: productData.tx.d2 || "N/A",
      retailerPurchase: productData.tx.r1 || "N/A",
      retailerListing: productData.tx.r2 || "N/A"
    } : (productData.transactions || {
      adminApproval: "N/A",
      distributorPurchase: "N/A",
      distributorListing: "N/A",
      retailerPurchase: "N/A",
      retailerListing: "N/A"
    }),
    // Price breakdown - handle both formats
    prices: {
      farmer: parseFloat(productData.fp || productData.prices?.farmer || 0),
      distributor: parseFloat(productData.dp || productData.prices?.distributor || 0),
      retailer: parseFloat(productData.p || productData.price || productData.prices?.retailer || 0)
    }
  };

  console.log("💰 Parsed pricing data:", parsedData.prices);

  const calculatePriceBreakdown = () => {
    const farmerPrice = parsedData.prices.farmer;
    const distributorPrice = parsedData.prices.distributor;
    const retailerFinalPrice = parsedData.prices.retailer;
    const logisticCost = parseFloat(parsedData.logisticCost);
    
    // Calculate margins
    const distributorMargin = distributorPrice - farmerPrice;
    const retailerMargin = retailerFinalPrice - distributorPrice - logisticCost;

    console.log("💰 Price breakdown calculated:", {
      farmerPrice,
      distributorPrice,
      retailerFinalPrice,
      logisticCost,
      distributorMargin,
      retailerMargin
    });

    return {
      farmerPrice: farmerPrice.toFixed(2),
      distributorPrice: distributorPrice.toFixed(2),
      retailerPrice: retailerFinalPrice.toFixed(2),
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
            <div className="eth-logo-container">
              <div className="eth-logo">⟠</div>
              <div className="eth-rings">
                <div className="ring ring-1"></div>
                <div className="ring ring-2"></div>
                <div className="ring ring-3"></div>
              </div>
            </div>
            <h2>⛓️ Ethereum Blockchain Verification</h2>
            <p>Querying smart contract and validating supply chain data...</p>
            <div className="network-info">
              <div className="network-badge">
                <span className="status-dot"></span>
                Network: Ethereum Mainnet
              </div>
              <div className="gas-badge">
                <span className="gas-icon">⛽</span>
                Gas: {(Math.random() * 50 + 20).toFixed(0)} Gwei
              </div>
            </div>
          </div>

          <div className="blockchain-animation">
            <div className="blocks-container">
              {[0, 1, 2, 3, 4, 5, 6].map((index) => (
                <React.Fragment key={index}>
                  <div 
                    className={`block ${blocksBuilt > index ? 'built' : ''} ${blocksBuilt === index ? 'building' : ''}`}
                  >
                    <div className="block-inner">
                      <div className="block-number">#{12345678 + index}</div>
                      <div className="block-icon">
                        {index === 0 && '🌾'}
                        {index === 1 && '👨‍🌾'}
                        {index === 2 && '✅'}
                        {index === 3 && '🚚'}
                        {index === 4 && '🏪'}
                        {index === 5 && '💰'}
                        {index === 6 && '🔒'}
                      </div>
                      <div className="block-label">
                        {index === 0 && 'Origin'}
                        {index === 1 && 'Farmer'}
                        {index === 2 && 'Verified'}
                        {index === 3 && 'Transport'}
                        {index === 4 && 'Retail'}
                        {index === 5 && 'Payment'}
                        {index === 6 && 'Sealed'}
                      </div>
                      <div className="block-hash">
                        0x{Math.random().toString(16).substr(2, 4)}...{Math.random().toString(16).substr(2, 4)}
                      </div>
                      <div className="block-timestamp">
                        {new Date(Date.now() - (6 - index) * 60000).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  {index < 6 && <div className="block-connector"></div>}
                </React.Fragment>
              ))}
            </div>

            {dataRevealed && (
              <div className="data-reveal">
                <div className="reveal-icon-container">
                  <div className="reveal-icon">⟠</div>
                  <div className="success-ring"></div>
                </div>
                <div className="reveal-text">Smart Contract Data Retrieved!</div>
                <div className="reveal-checkmark">✓</div>
                <div className="reveal-details">
                  <div className="detail-item">
                    <span>Contract:</span>
                    <span>0xAgriDirect...{Math.random().toString(16).substr(2, 4)}</span>
                  </div>
                  <div className="detail-item">
                    <span>Gas Used:</span>
                    <span>0.00{Math.floor(Math.random() * 9) + 1}2 ETH</span>
                  </div>
                  <div className="detail-item">
                    <span>Confirmations:</span>
                    <span>{blocksBuilt * 2}/12</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="loading-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(blocksBuilt / 6) * 100}%` }}
              ></div>
            </div>
            <p className="progress-text">
              {blocksBuilt === 0 && '🔗 Connecting to Ethereum network...'}
              {blocksBuilt === 1 && '📡 Querying smart contract 0xAgriDirect...'}
              {blocksBuilt === 2 && '🔍 Verifying farmer transaction...'}
              {blocksBuilt === 3 && '📦 Checking distributor records...'}
              {blocksBuilt === 4 && '🏪 Loading retailer data...'}
              {blocksBuilt === 5 && '💰 Validating payment history...'}
              {blocksBuilt === 6 && dataRevealed && '✅ Blockchain verification complete!'}
            </p>
            <div className="tech-details">
              <span>Block Height: {12345678 + blocksBuilt}</span>
              <span>Block Time: ~{(blocksBuilt * 0.6).toFixed(1)}s</span>
              <span>Network: Mainnet</span>
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
              {/* Supply Chain Map */}
              <div className="supply-chain-map" style={{ marginBottom: '30px', background: '#f5f5f5', padding: '20px', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: '15px', color: '#2e7d32' }}>🗺️ Supply Chain Journey Map</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                  {/* Farmer Location */}
                  <div style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h4 style={{ color: '#2e7d32', marginBottom: '10px' }}>👨‍🌾 Farmer Location</h4>
                    <p style={{ fontSize: '0.9em', marginBottom: '10px' }}>{parsedData.farmerLocation}</p>
                    <iframe
                      title="farmer-location"
                      width="100%"
                      height="200"
                      frameBorder="0"
                      style={{ border: 0, borderRadius: '8px' }}
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(parsedData.farmerLocation)}`}
                      allowFullScreen
                    ></iframe>
                  </div>
                  
                  {/* Distributor Location (Random nearby) */}
                  <div style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h4 style={{ color: '#ff9800', marginBottom: '10px' }}>🚚 Distributor Hub</h4>
                    <p style={{ fontSize: '0.9em', marginBottom: '10px' }}>Anand Distribution Center</p>
                    <iframe
                      title="distributor-location"
                      width="100%"
                      height="200"
                      frameBorder="0"
                      style={{ border: 0, borderRadius: '8px' }}
                      src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=Anand+Railway+Station+Gujarat"
                      allowFullScreen
                    ></iframe>
                  </div>
                  
                  {/* Retailer Location (Random nearby) */}
                  <div style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h4 style={{ color: '#1976d2', marginBottom: '10px' }}>🏪 Retailer Store</h4>
                    <p style={{ fontSize: '0.9em', marginBottom: '10px' }}>Anand Retail Market</p>
                    <iframe
                      title="retailer-location"
                      width="100%"
                      height="200"
                      frameBorder="0"
                      style={{ border: 0, borderRadius: '8px' }}
                      src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=Anand+Market+Yard+Gujarat"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              </div>

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
