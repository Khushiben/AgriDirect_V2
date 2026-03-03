import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // added for Buy redirect
import "../styles/Marketplace.css";

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [distributors, setDistributors] = useState([]);
  const [distributorModalFor, setDistributorModalFor] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const loggedInUserId = storedUser.userId || null;
  const role = storedUser.role || "consumer"; // added role

  const navigate = useNavigate(); // hook for navigation

  useEffect(() => {
    const fetchMarketplace = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products/marketplace");
        setProducts(res.data);
      } catch (error) {
        console.error("Error fetching marketplace products:", error);
      }
    };
    fetchMarketplace();
  }, []);

const openDetails = (p) => setSelectedProduct(p);
const closeDetails = () => setSelectedProduct(null);

  // open distributor selection modal and fetch distributors
  const openDistributorModal = async (product) => {
    setDistributorModalFor(product);
    try {
      const res = await axios.get("http://localhost:5000/api/auth/distributors");
      setDistributors(res.data || []);
    } catch (error) {
      console.error("Error fetching distributors:", error);
      setDistributors([]);
    }
  };

  const chooseDistributor = async (productId, distributorId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/products/${productId}/choose-distributor`,
        { distributorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts((prev) => prev.map((p) => (p._id === productId ? res.data : p)));
      setDistributorModalFor(null);
      setDistributors([]);
    } catch (error) {
      console.error(error);
      alert("Failed to choose distributor.");
    }
  };

  // ✅ FIXED: send productId ONLY (nothing else changed)
  const handleBuy = (product) => {
    navigate(`/checkout?productId=${product._id}`);
  };


  return (
    <div className="marketplace-page">
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
        <h1> 🛒 Marketplace 🛒 </h1>
      </marquee>

      <div className="crops-grid">
        {products.map((crop) => (
          <div key={crop._id} className="crop-grid-item">
            <img
              src={`http://localhost:5000/uploads/licenses/${crop.image}`}
              alt={crop.variety}
            />
            <div className="crop-grid-details">
              <strong>{crop.variety}</strong>
              <p>₹ {crop.price}</p>
              {crop.qualityGrade && <p>Grade: {crop.qualityGrade}</p>}
              {crop.adminRating != null && <p>Rating: {crop.adminRating}🌟</p>}
              {(crop.minPrice || crop.maxPrice) && (
                <p>Price range: ₹{crop.minPrice || '-'} - ₹{crop.maxPrice || '-'}</p>
              )}
              <p>Farmer: {crop.farmer?.name}</p>
              <p>Available Quantity: {crop.quantity} kg</p>
              {crop.status === "verified" && (
                <span className="status-badge verified">VERIFIED</span>
              )}

              <div className="card-buttons">
                <button className="action-btn" onClick={() => openDetails(crop)}>Get Details</button>

                {/* Buy button for non-farmers */}
                {/* Buy button for non-farmers and non-admins */}
{role !== "farmer" && role !== "admin" && (
  <button
    className="action-btn buy-btn"
    onClick={() => {
      if (!loggedInUserId) {
        alert("Please login to buy this product.");
        navigate("/login");
      } else {
        handleBuy(crop);
      }
    }}
  >
    Buy
  </button>
)}


                {/* Farmer buttons remain unchanged */}
                {loggedInUserId === (crop.farmer && crop.farmer._id) && (
                  <>
                    <button
                      className="action-btn"
                      onClick={() => openDistributorModal(crop)}
                      disabled={crop.distributor && crop.distributorApprovalStatus !== 'rejected'}
                    >
                      {crop.distributor && crop.distributorApprovalStatus !== 'rejected'
                        ? "Distributor Chosen"
                        : "Choose Distributor"}
                    </button>
                    {crop.distributor && (
                      <div style={{ marginTop: '4px', fontSize: '0.9em' }}>
                        {crop.distributorApprovalStatus === 'pending' && (
                          <span className="status-badge pending">Awaiting distributor approval</span>
                        )}
                        {crop.distributorApprovalStatus === 'approved' && (
                          <span className="status-badge verified">Distributor approved</span>
                        )}
                        {crop.distributorApprovalStatus === 'rejected' && (
                          <span className="status-badge rejected">Distributor rejected</span>
                        )}
                      </div>
                    )}
                  </>
                )}
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
      )}

      {/* Distributor selection modal */}
      {distributorModalFor && (
        <div className="modal-backdrop" onClick={() => setDistributorModalFor(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setDistributorModalFor(null)}>✕</button>
            <h2>Choose Distributor for {distributorModalFor.variety}</h2>
            <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
              {distributors.length === 0 && <p>No distributors found.</p>}
              {distributors.map((d) => (
                <div key={d._id} style={{ borderBottom: '1px solid #eee', padding: '12px 0' }}>
                  <strong>{d.name}</strong>
                  <p style={{ margin: '4px 0' }}>{d.email} | {d.phone}</p>
                  <p style={{ margin: '4px 0', color: '#555' }}>{d.address || `${d.district || ''} ${d.state || ''}`}</p>
                  <button className="action-btn" onClick={() => chooseDistributor(distributorModalFor._id, d._id)}>Choose</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace; 