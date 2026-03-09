import React from "react";
import "../styles/FarmerDashboard.css";
import { Link, useNavigate } from "react-router-dom";
import AddProduct from "./AddProduct";
import { useEffect, useState } from "react";
import axios from "axios";
import ProfilePictureUpload from "../components/ProfilePictureUpload";
import ColdStorage from "../components/ColdStorage";


const FarmerDashboard = ({ name, district }) => {
  // Mock data for crops - Replace with API data later
  const [farmer, setFarmer] = useState(null);
  const [addedCrops, setAddedCrops] = useState([]);
  const [address, setAddress] = useState("");
  const [notification, setNotification] = useState("");
  const [seenDistributorNotifs, setSeenDistributorNotifs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("seenDistributorNotifications") || "{}");
    } catch (e) {
      return {};
    }
  });
  const [displayedDistributorProducts, setDisplayedDistributorProducts] = useState([]);
  const [soldCrops, setSoldCrops] = useState([]);
  const [showColdStorage, setShowColdStorage] = useState(false);
  const [showETHTransaction, setShowETHTransaction] = useState(false);
  const [ethTxDetails, setEthTxDetails] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    address: "",
    phone: "",
    farmSize: ""
  });

  const navigate = useNavigate();
  const loggedInUserId = localStorage.getItem("userId");

  // Fetch farmer data
  useEffect(() => {
    const fetchFarmer = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await axios.get("http://localhost:5000/api/farmer/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setFarmer(response.data.farmer);
          setAddress(response.data.farmer.address || "Anand, Gujarat");
        }
      } catch (error) {
        console.error("Error fetching farmer data:", error);
      }
    };

    fetchFarmer();
  }, []);

  // Fetch sold crops
  useEffect(() => {
    const fetchSoldCrops = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(
          "http://localhost:5000/api/farmer/sold-crops",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.success) {
          setSoldCrops(response.data.soldCrops);
        }
      } catch (error) {
        console.error("Error fetching sold crops:", error);
      }
    };

    fetchSoldCrops();
  }, []);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        return;
      }

      const res = await axios.get("http://localhost:5000/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Only keep crops added by this farmer
      const myCrops = res.data.filter((crop) => {
        const farmerId = crop.farmer && crop.farmer.toString ? crop.farmer.toString() : crop.farmer;
        return farmerId === loggedInUserId;
      });

      // Separate pending and approved crops
      const pending = myCrops.filter(crop => crop.status === "pending");
      const approved = myCrops.filter(crop => crop.status === "approved");

      setAddedCrops(pending); // Pending crops = waiting for admin approval
      setSoldCrops(approved); // Approved crops = approved by admin
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Listen for product submission events
  useEffect(() => {
    const handleProductAdded = () => {
      console.log("Product added event received, refreshing crops...");
      fetchProducts();
    };

    window.addEventListener('productAdded', handleProductAdded);
    
    return () => {
      window.removeEventListener('productAdded', handleProductAdded);
    };
  }, []);
  useEffect(() => {
    const handleProductSubmit = (event) => {
      const { productName, gasFee } = event.detail;
      setEthTxDetails({ productName, gasFee });
      setShowETHTransaction(true);
      
      // Hide modal after 3 seconds
      setTimeout(() => {
        setShowETHTransaction(false);
        setEthTxDetails(null);
      }, 3000);
    };

    window.addEventListener('productSubmit', handleProductSubmit);
    
    return () => {
      window.removeEventListener('productSubmit', handleProductSubmit);
    };
  }, []);

  const handleProfilePictureUpload = async (profilePicturePath) => {
    try {
      // Update local state immediately
      setFarmer((prev) => ({ ...prev, profilePicture: profilePicturePath }));
      
      // Fetch updated farmer data to ensure sync
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/farmer/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setFarmer(response.data.farmer);
      }
    } catch (error) {
      console.error("Error syncing profile picture:", error);
    }
  };

  const handleEditProfile = () => {
    setEditFormData({
      name: farmer?.name || "",
      address: farmer?.address || "",
      phone: farmer?.phone || "",
      farmSize: farmer?.farmSize || ""
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/api/farmer/profile",
        editFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setFarmer(response.data.farmer);
        setAddress(response.data.farmer.address);
        setIsEditingProfile(false);
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setEditFormData({
      name: "",
      address: "",
      phone: "",
      farmSize: ""
    });
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="welcome-bar">
          <div className="welcome-text">
            <h1>Welcome, {farmer?.name || "Farmer"}</h1>
            <p className="district-text">
              {district || "Anand District"} • Gujarat
            </p>
          </div>
          <div className="header-actions">
            <div className="notification-icon">🔔</div>
            <div className="profile-upload-wrapper">
              <ProfilePictureUpload
                currentImage={farmer?.profilePicture}
                onUpload={handleProfilePictureUpload}
              />
            </div>
          </div>
        </div>

        {notification && (
          <span className="notification-banner">
            {notification}
            <button
              className="notification-close"
              onClick={() => setNotification("")}
            >
              ×
            </button>
            <button
              className="notification-cta"
              onClick={() => {
                setNotification("");
                navigate("/marketplace");
              }}
            >
              OK
            </button>
          </span>
        )}
        <div className="action-buttons">
          <button className="cold-storage-btn" onClick={() => setShowColdStorage(!showColdStorage)}>
            🏠 Cold Storage
          </button>
          <Link to="/farmer/AddProduct">
            <button className="add-btn">ADD PRODUCT</button>
          </Link>
        </div>
      </header>

      {/* Dashboard Content Grid */}
      <main className="dashboard-main">
        {showColdStorage ? (
          <div className="cold-storage-full-view">
            <div className="cold-storage-header">
              <button className="back-to-dashboard-btn" onClick={() => setShowColdStorage(false)}>
                ← Back To Dashboard
              </button>
              <h2>❄️ Cold Storage Management</h2>
            </div>
            <ColdStorage farmerId={loggedInUserId} />
          </div>
        ) : (
          <div className="dashboard-content-grid">
            {/* Column 1: Profile */}
            <aside className="profile-sidebar">
                <div className="farmer-profile-card">
                  <div className="avatar-circle">
                    {farmer?.profilePicture ? (
                      <img 
                        src={farmer.profilePicture.startsWith('data:') 
                          ? farmer.profilePicture 
                          : `http://localhost:5000/api/profile/pictures/${farmer.profilePicture}`
                        } 
                        alt="Farmer Profile" 
                      />
                    ) : (
                      <div className="avatar-placeholder">👤</div>
                    )}
                  </div>
                  
                  {!isEditingProfile ? (
                    <>
                      <h3>{farmer?.name || "Farmer Name"}</h3>
                      <p className="profile-detail">📍 {farmer?.address || "Address not available"}</p>
                      {farmer?.phone && <p className="profile-detail">📞 {farmer.phone}</p>}
                      {farmer?.farmSize && <p className="profile-detail">🌾 Farm: {farmer.farmSize} acres</p>}
                      <button className="edit-profile-btn" onClick={handleEditProfile}>
                        ✏️ EDIT PROFILE
                      </button>
                    </>
                  ) : (
                    <div className="edit-profile-form">
                      <div className="form-group">
                        <label>Name:</label>
                        <input
                          type="text"
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                          placeholder="Enter your name"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Address:</label>
                        <input
                          type="text"
                          value={editFormData.address}
                          onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                          placeholder="Enter your address"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Phone:</label>
                        <input
                          type="tel"
                          value={editFormData.phone}
                          onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                          placeholder="Enter phone number"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Farm Size (acres):</label>
                        <input
                          type="number"
                          value={editFormData.farmSize}
                          onChange={(e) => setEditFormData({...editFormData, farmSize: e.target.value})}
                          placeholder="Enter farm size"
                        />
                      </div>
                      
                      <div className="form-actions">
                        <button className="save-btn" onClick={handleSaveProfile}>
                          ✅ SAVE
                        </button>
                        <button className="cancel-btn" onClick={handleCancelEdit}>
                          ❌ CANCEL
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </aside>

              {/* Column 2: Right Content */}
              <div className="dashboard-right-content">
                {/* Farm Map */}
                <section className="location-area">
                  <div className="farm-map-card">
                    <h4>🗺️ Farm Location</h4>

                    {address ? (
                      <iframe
                        title="farm-map"
                        loading="lazy"
                        allowFullScreen
                        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyCz5t2k2y2h2z2z2z2z2z2z2z2z2z2z2&q=${encodeURIComponent(
                          address
                        )}`}
                      ></iframe>
                    ) : (
                      <div className="map-loading">Loading map...</div>
                    )}
                  </div>
                </section>

                {/* Crops Section */}
                <div className="crops-section">
                  {/* Sold Crops - Approved by Admin */}
                  <section className="sold-crops-area">
                    <h2>✅ Approved Crops</h2>
                    <div className="crops-grid">
                      {soldCrops.length === 0 ? (
                        <p className="empty-text">No approved crops yet</p>
                      ) : (
                        soldCrops.map((sale) => (
                          <div key={sale._id} className="crop-grid-item">
                            {sale.product?.image ? (
                              <img
                                src="/rice.jpeg"
                                alt={sale.product?.variety}
                              />
                            ) : (
                              <div className="no-image">No image</div>
                            )}

                            <div className="crop-grid-details">
                              <strong>{sale.product?.variety}</strong>
                              <p>₹ {sale.product?.price}/kg</p>
                              <p>Quantity: {sale.quantity} kg</p>
                              <p>Total: ₹ {sale.totalPrice}</p>
                              <span className="status-badge verified">SOLD</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  {/* Added Crops - Pending Admin Approval */}
                  <section className="added-crops-area">
                    <h2>⏳ Added Crops (Pending Approval)</h2>
                    <div className="crops-grid">
                      {addedCrops.length === 0 ? (
                        <p className="empty-text">No crops waiting for approval</p>
                      ) : (
                        addedCrops
                          .filter(crop => {
                            const farmerId = crop.farmer && crop.farmer.toString ? crop.farmer.toString() : crop.farmer;
                            return farmerId === loggedInUserId;
                          })
                          .map((crop) => (
                            <div key={crop._id} className="crop-grid-item">
                              {crop.image ? (
                                /\.(jpe?g|png|gif|webp|bmp)$/i.test(crop.image) ? (
                                  <img
                                    src="/rice.jpeg"
                                    alt="Crop"
                                  />
                                ) : (
                                  <a
                                    href={`http://localhost:5000/uploads/licenses/${crop.image}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="no-image"
                                  >
                                    View file
                                  </a>
                                )
                              ) : (
                                <div className="no-image">No image</div>
                              )}

                              <div className="crop-grid-details">
                                <strong>{crop.variety}</strong>
                                <p>₹ {crop.price}/kg</p>
                                <p>Quantity: {crop.quantity} kg</p>
                                <span className="status-badge pending">PENDING</span>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}
        </main>

      {/* ETH Transaction Modal */}
      {showETHTransaction && (
        <div className="eth-transaction-overlay">
          <div className="eth-transaction-modal">
            <h3>⚡ Processing ETH Transaction</h3>
            <div className="transaction-animation">
              <div className="eth-icon rotating">Ξ</div>
              <p>Submitting product to blockchain...</p>
              <div className="transaction-details">
                <p><strong>Product:</strong> {ethTxDetails?.productName}</p>
                <p><strong>Gas Fee:</strong> {ethTxDetails?.gasFee}</p>
                <p><strong>Transaction ID:</strong> 0x7f3a...8b2c</p>
              </div>
              <div className="loading-dots">
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;
