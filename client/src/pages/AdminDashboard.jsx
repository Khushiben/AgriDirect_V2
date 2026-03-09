import "../styles/AdminDashboard.css";
import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [marketplaceProduct, setMarketplaceProduct] = useState(null);
  const [grade, setGrade] = useState("");
  const [rating, setRating] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showETHModal, setShowETHModal] = useState(false);
  const [ethTxDetails, setEthTxDetails] = useState(null);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [txStatus, setTxStatus] = useState("processing");

  const fetchAllProducts = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/products/admin/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const openDetails = (product) => setSelectedProduct(product);
  const closeDetails = () => setSelectedProduct(null);

  // OPEN MARKETPLACE FORM
  const openMarketplaceForm = (product) => {
    setMarketplaceProduct(product);
    // Set min price to locked initial price
    setMinPrice(product.price || '');
    setMaxPrice('');
  };

  const closeMarketplaceForm = () => {
    setMarketplaceProduct(null);
    setGrade("");
    setRating("");
    setMinPrice("");
    setMaxPrice("");
  };

  const handleMarketplaceSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      
      // Show loading state
      const submitButton = e.target.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Approving...";
      }

      const res = await axios.put(
        `http://localhost:5000/api/products/admin/approve/${marketplaceProduct._id}`,
        {
          qualityGrade: grade,
          adminRating: rating,
          minPrice,
          maxPrice,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Show ETH transaction modal
      if (res.data.success) {
        setEthTxDetails({
          txHash: res.data.txHash,
          gasFee: res.data.gasFee,
          productName: res.data.productName,
          price: minPrice
        });
        setTxStatus("processing");
        setShowETHModal(true);
        
        closeMarketplaceForm();
        
        // Change to confirmed after 3 seconds
        setTimeout(() => {
          setTxStatus("confirmed");
        }, 3000);
        
        // Refresh products after 5 seconds
        setTimeout(() => {
          fetchAllProducts();
        }, 5000);
      }
      
      // Reset button state
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Approve for Marketplace";
      }
    } catch (error) {
      console.error("Marketplace approval error:", error);
      
      // Show detailed error message
      const errorMessage = error.response?.data?.message || error.message || "Failed to approve product";
      alert(`Marketplace approval error: ${errorMessage}`);
      
      // Reset button state
      const submitButton = e.target.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Approve for Marketplace";
      }
    }
  };

  const closeETHModal = () => {
    setShowETHModal(false);
    setEthTxDetails(null);
    setTxStatus("processing");
  };

  const handleFarmerClick = (farmerId, farmerName) => {
    if (selectedFarmer === farmerId) {
      // Deselect if clicking same farmer
      setSelectedFarmer(null);
    } else {
      setSelectedFarmer(farmerId);
    }
  };

  // Filter products by selected farmer
  const displayedProducts = selectedFarmer 
    ? products.filter(p => p.farmer?._id === selectedFarmer)
    : products;

  // Get unique farmers
  const uniqueFarmers = [...new Map(products.map(p => [p.farmer?._id, p.farmer])).values()];

  return (
    <div className="admin-dashboard">
      {/* Stats Section */}
      <div className="admin-stats">
        <div className="stat-card">
          <h3>📊 Current Products</h3>
          <p className="stat-number">{products.length}</p>
          <p className="stat-label">Pending Approval</p>
        </div>
        <div className="stat-card">
          <h3>👨‍🌾 Farmers</h3>
          <p className="stat-number">{uniqueFarmers.length}</p>
          <p className="stat-label">Active Farmers</p>
        </div>
      </div>

      <section className="added-crops-column">
        <marquee
        behavior="scroll"
        direction="left"
        scrollamount="5"
        style={{ 
          color: "black", 
          padding: "5px", 
          fontSize: "18px", 
          fontWeight: "bold", 
          backgroundColor: ""
        }}
      >
       <h1 className="section-label">ALL FARMER CROPS ASSIGNED TO YOU</h1>
      </marquee>

        {/* Farmer Filter Buttons */}
        {uniqueFarmers.length > 0 && (
          <div className="farmer-filter">
            <button 
              className={`farmer-btn ${!selectedFarmer ? 'active' : ''}`}
              onClick={() => setSelectedFarmer(null)}
            >
              All Farmers ({products.length})
            </button>
            {uniqueFarmers.map(farmer => farmer && (
              <button 
                key={farmer._id}
                className={`farmer-btn ${selectedFarmer === farmer._id ? 'active' : ''}`}
                onClick={() => handleFarmerClick(farmer._id, farmer.name)}
              >
                {farmer.name} ({products.filter(p => p.farmer?._id === farmer._id).length})
              </button>
            ))}
          </div>
        )}

        <div className="crops-grid">
          {displayedProducts.map((crop) => (
            <div key={crop._id} className="crop-grid-item">
              <div className="img-wrapper">
                <img
                  src="/rice.jpeg"
                  alt={crop.variety || "Crop"}
                />
              </div>

              <div className="crop-grid-details">
                <div>
                  <strong>{crop.variety}</strong>
                  <p>₹ {crop.price}</p>
                  <p>Farmer: {crop.farmer?.name}</p>

                  {/* STATUS BADGE */}
                  {crop.status && (
                    <p className={`status-badge ${crop.status}`}>
                      {crop.status.toUpperCase()}
                    </p>
                  )}
                </div>

                <div className="card-buttons">
                  <button
                    className="options-btn"
                    onClick={() => openDetails(crop)}
                  >
                    ...
                  </button>

                  <button
                    className="marketplace-btn"
                    onClick={() => openMarketplaceForm(crop)}
                    disabled={crop.status === "verified"}
                  >
                    {crop.status === "verified" ? "Already Verified" : "Add to Marketplace"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EXISTING DETAILS MODAL (UNCHANGED) */}
      {selectedProduct && (
        <div className="admin-modal-backdrop" onClick={closeDetails}>
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeDetails}>
              ✕
            </button>
            <div className="admin-modal-body">
              <div className="admin-modal-image">
                <img
                  src="/rice.jpeg"
                  alt={selectedProduct.variety}
                />
              </div>
              <div className="admin-modal-info">
                <h2>{selectedProduct.variety}</h2>
                <p><strong>Rice Type:</strong> {selectedProduct.riceType}</p>
                <p><strong>Category:</strong> {selectedProduct.category}</p>
                <p><strong>Price:</strong> ₹ {selectedProduct.price}</p>
                <p><strong>Negotiable:</strong> {selectedProduct.negotiable || 'N/A'}</p>
                <p><strong>Farmer:</strong> {selectedProduct.farmer?.name} ({selectedProduct.farmer?.email})</p>
                <p><strong>Quantity:</strong> {selectedProduct.quantity} kg</p>
                <p><strong>Season:</strong> {selectedProduct.season}</p>
                <p><strong>Sowing Date:</strong> {selectedProduct.sowingDate ? new Date(selectedProduct.sowingDate).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Harvest Date:</strong> {selectedProduct.harvestDate ? new Date(selectedProduct.harvestDate).toLocaleDateString() : 'N/A'}</p>

                <h4>Cultivation & Inputs</h4>
                <p><strong>Soil Type:</strong> {selectedProduct.soilType || 'N/A'}</p>
                <p><strong>Irrigation Type:</strong> {selectedProduct.irrigationType || 'N/A'}</p>
                <p><strong>Seed Source:</strong> {selectedProduct.seedSource || 'N/A'}</p>
                {selectedProduct.privateCompany && <p><strong>Private Company:</strong> {selectedProduct.privateCompany}</p>}
                <p><strong>Fertilizer:</strong> {selectedProduct.fertilizer || 'N/A'}</p>
                <p><strong>Fertilizer Qty:</strong> {selectedProduct.fertilizerQty || 'N/A'}</p>
                <p><strong>Applications:</strong> {selectedProduct.applications || 'N/A'}</p>
                <p><strong>Last Fertilizer Date:</strong> {selectedProduct.lastFertilizerDate ? new Date(selectedProduct.lastFertilizerDate).toLocaleDateString() : 'N/A'}</p>

                <h4>Quality Parameters</h4>
                <p>Grain Length: {selectedProduct.grainLength ?? 'N/A'}</p>
                <p>Broken: {selectedProduct.broken ?? 'N/A'}%</p>
                <p>Moisture: {selectedProduct.moisture ?? 'N/A'}%</p>
                <p>Color: {selectedProduct.color || 'N/A'}</p>
                <p>Foreign Matter: {selectedProduct.foreignMatter ?? 'N/A'}%</p>
                <p>Damaged: {selectedProduct.damaged ?? 'N/A'}%</p>
                <p>Polishing: {selectedProduct.polishing || 'N/A'}</p>
                <p>Aging: {selectedProduct.aging || 'N/A'}</p>

                <h4>Pests / Diseases</h4>
                <p><strong>Disease Occurred:</strong> {selectedProduct.diseaseOccurred || 'No'}</p>
                {selectedProduct.pests && selectedProduct.pests.length ? (
                  <ul>
                    {selectedProduct.pests.map((p, i) => (
                      <li key={i}>{p.pestName} — {p.pesticide} ({p.sprays} sprays) — Last: {p.lastSpray ? new Date(p.lastSpray).toLocaleDateString() : 'N/A'}</li>
                    ))}
                  </ul>
                ) : <p>None reported</p>}

                <h4>Meta</h4>
                <p>Created: {selectedProduct.createdAt ? new Date(selectedProduct.createdAt).toLocaleString() : 'N/A'}</p>
                <p>Updated: {selectedProduct.updatedAt ? new Date(selectedProduct.updatedAt).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW MARKETPLACE FORM MODAL */}
      {marketplaceProduct && (
        <div
          className="admin-marketplace-backdrop"
          onClick={closeMarketplaceForm}
        >
          <div
            className="admin-marketplace-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeMarketplaceForm}>
              ✕
            </button>
            <h2>Add to Marketplace</h2>

            <form onSubmit={handleMarketplaceSubmit}>
              <div className="locked-price-info">
                <h4>🔒 Locked Initial Price</h4>
                <div className="locked-price">
                  ₹{marketplaceProduct.price}
                </div>
                <p className="price-note">This price was set by the farmer and cannot be changed</p>
              </div>

              <label>Quality Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                required
              >
                <option value="">Select Grade</option>
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
              </select>

              <label>Admin Rating (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                required
              />

              <label>Minimum Price (₹) - Locked</label>
              <input
                type="number"
                step="0.01"
                value={minPrice}
                readOnly
                disabled
                style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                placeholder="Set by farmer"
              />

              <label>Maximum Price (₹) - Admin Sets This</label>
              <input
                type="number"
                step="0.01"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min={minPrice}
                required
                placeholder="Enter maximum price"
              />

              {maxPrice && parseFloat(maxPrice) <= parseFloat(minPrice) && (
                <p className="error-message">Maximum price must be greater than minimum price (₹{minPrice})</p>
              )}

              <button 
                type="submit" 
                className="submit-marketplace-btn"
                disabled={!maxPrice || parseFloat(maxPrice) <= parseFloat(minPrice)}
              >
                Approve & Set Price Range
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ETH TRANSACTION MODAL */}
      {showETHModal && ethTxDetails && (
        <div className="eth-modal-backdrop" onClick={closeETHModal}>
          <div className="eth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeETHModal}>✕</button>
            
            <div className="eth-icon">⟠</div>
            <h2>{txStatus === "processing" ? "Processing Transaction..." : "Transaction Confirmed"}</h2>
            <p className="eth-subtitle">
              {txStatus === "processing" ? "Please wait while we process your approval" : "Product approved and added to marketplace"}
            </p>
            
            <div className="eth-details">
              <div className="eth-row">
                <span className="eth-label">Product:</span>
                <span className="eth-value">{ethTxDetails.productName}</span>
              </div>
              
              <div className="eth-row">
                <span className="eth-label">Price:</span>
                <span className="eth-value">₹{ethTxDetails.price}</span>
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
                    "✓ Confirmed"
                  )}
                </span>
              </div>
            </div>
            
            <button 
              className="eth-close-btn" 
              onClick={closeETHModal}
              disabled={txStatus === "processing"}
            >
              {txStatus === "processing" ? "Please Wait..." : "Close"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;