import "../styles/AdminDashboard.css";
import { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // NEW STATE FOR MARKETPLACE FORM
  const [marketplaceProduct, setMarketplaceProduct] = useState(null);
  const [grade, setGrade] = useState("");
  const [rating, setRating] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

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

      alert("Product added to marketplace successfully!");
      closeMarketplaceForm();
      // update local list or refresh
      fetchAllProducts();
    } catch (error) {
      console.error("Marketplace approval error:", error);
    }
  };

  return (
    <div className="admin-dashboard">
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
    backgroundColor: ""  // <-- correct way
  }}
>
 <h1 className="section-label">ALL FARMER CROPS</h1>
</marquee>
        

        <div className="crops-grid">
          {products.map((crop) => (
            <div key={crop._id} className="crop-grid-item">
              <div className="img-wrapper">
                <img
                  src={`http://localhost:5000/uploads/licenses/${crop.image}`}
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
                  src={`http://localhost:5000/uploads/licenses/${selectedProduct.image}`}
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
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                required
              />

              <label>Minimum Price (₹)</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                required
              />

              <label>Maximum Price (₹)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                required
              />

              <button type="submit" className="submit-marketplace-btn">
                Approve & Publish
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;