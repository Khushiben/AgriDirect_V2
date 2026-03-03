import React from "react";
import "../styles/FarmerDashboard.css";
import { Link, useNavigate } from "react-router-dom";
import AddProduct from "./AddProduct";
import { useEffect, useState } from "react";
import axios from "axios";


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


  // id of currently logged-in farmer (stored inside "user" object at login)
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const loggedInUserId = storedUser.userId || null;
  const navigate = useNavigate();

  //*************************************  use effect  *************************** */
//---------------------------------useeffect for products to diplay--------------------------//
useEffect(() => {
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token"); // ✅ get token

      const res = await axios.get(
        "http://localhost:5000/api/products",
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ send token
          },
        }
      );

      setAddedCrops(res.data);
      // record verified items in-page (no alert popups)
      let messages = [];
      // Only notify for verified products that do NOT yet have a distributor chosen
      const verified = res.data.filter(p => p.status === "verified" && !p.distributor);
      if (verified.length) {
        messages.push(...verified.map(
          (p) => `Your product ${p.variety} is verified – choose distributor from marketplace!!!`
        ));
      }
      // show messages from distributor decisions but only if not seen yet
      const seen = seenDistributorNotifs || {};
      const rejected = res.data.filter(p => p.distributorApprovalStatus === "rejected" && seen[p._id] !== "rejected");
      if (rejected.length) {
        messages.push(...rejected.map(
          (p) => `Your product ${p.variety} was rejected by the distributor.`
        ));
      }
      const approved = res.data.filter(p => p.distributorApprovalStatus === "approved" && seen[p._id] !== "approved");
      if (approved.length) {
        messages.push(...approved.map(
          (p) => `Your product ${p.variety} was approved by the distributor!`
        ));
      }
      // record which distributor-related products we displayed so we can mark them seen on OK
      const displayedIds = [...rejected.map(p => p._id), ...approved.map(p => p._id)];
      setDisplayedDistributorProducts(displayedIds);
      if (messages.length) {
        // do not call alert(); keep message in notification pill
        setNotification(messages.join(" \n"));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  fetchProducts();
}, []);
useEffect(() => {
  const fetchSoldCrops = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/distributor-purchases/my-sales",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSoldCrops(res.data);
    } catch (err) {
      console.error("Error fetching sold crops:", err);
    }
  };

  fetchSoldCrops();
}, []);

//---------------------------------useeffect for maps to diplay--------------------------//
useEffect(() => {
  const fetchFarmer = async () => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

      if (!storedUser.userId) return;

      const res = await axios.get(
        `http://localhost:5000/api/auth/user/${storedUser.userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFarmer(res.data); // ✅ store full farmer object
    } catch (error) {
      console.error("Error fetching farmer:", error);
    }
  };

  fetchFarmer();
}, []);



  return (
    <div className="farmer-page-wrapper">
      
      
      <main className="dashboard-main">
        {/* Welcome Header */}
        <section className="welcome-bar">
          <div className="welcome-text">
            <h1>HELLO, {name}!</h1>
            <span className="notif-pill">
              🔔 {notification || ""}
              {notification && (
                <button
                  className="notif-ok"
                  onClick={() => {
                    try {
                      const seen = JSON.parse(localStorage.getItem("seenDistributorNotifications") || "{}");
                      // mark each displayed distributor product as seen with its current status
                      displayedDistributorProducts.forEach(id => {
                        const p = addedCrops.find(c => c._id === id);
                        if (p && p.distributorApprovalStatus) {
                          seen[id] = p.distributorApprovalStatus;
                        }
                      });
                      localStorage.setItem("seenDistributorNotifications", JSON.stringify(seen));
                      setSeenDistributorNotifs(seen);
                      setDisplayedDistributorProducts([]);
                    } catch (e) {
                      console.error("Error saving seen notifications:", e);
                    }
                    setNotification("");
                    navigate("/marketplace");
                  }}
                >
                  OK
                </button>
              )}
            </span>
          </div>
          <Link to="/farmer/AddProduct">
          <button className="add-btn">ADD PRODUCT</button></Link>
        </section>

        {/* Dashboard Content Grid */}
        <div className="dashboard-content-grid">
          
          {/* Column 1: Profile */}
          <aside className="profile-sidebar">
            <div className="farmer-profile-card">
              <div className="avatar-circle">
                <img src="data:image/jpeg;base64,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" alt="Farmer" />
              </div>
              <h3>{farmer?.name || "Farmer Name"}</h3>
<p>{farmer?.address || "Address not available"}</p>
              <button className="edit-profile-btn">EDIT</button>
            </div>
          </aside>

          {/* Column 2: Farm Map */}
       <section className="location-area">
  <div className="farm-map-card">
    <h4>Farm Location</h4>
    <p className="farm-subtext">{address || "Loading location..."}</p>

    {address && (
      <iframe
        title="farm-map"
        width="100%"
        height="250"
        style={{ borderRadius: "10px", border: "none" }}
        loading="lazy"
        allowFullScreen
        src={`https://www.google.com/maps?q=${encodeURIComponent(
          address
        )}&output=embed`}
      ></iframe>
    )}
  </div>
</section>

          {/* Column 3: Sold Crops (Horizontal List) */}
<section className="added-crops-column">
  <h1 className="section-label">SOLD CROPS</h1>

  <div className="crops-grid">
    {soldCrops.length === 0 ? (
      <p className="empty-text">No crops sold yet</p>
    ) : (
      soldCrops.map((sale) => (
        <div key={sale._id} className="crop-grid-item">

          {/* IMAGE */}
          {sale.product?.image ? (
            <img
              src={`http://localhost:5000/uploads/licenses/${sale.product.image}`}
              alt={sale.product?.variety}
            />
          ) : (
            <div className="no-image">No image</div>
          )}

          {/* DETAILS */}
          <div className="crop-grid-details">
            <div>
              <strong>{sale.product?.variety}</strong>

              <p>Distributor: {sale.buyer?.name || "N/A"}</p>
              <p>Quantity Sold: {sale.quantity} kg</p>
              <p>Total Price: ₹{sale.totalPrice}</p>

              {/* STATUS BADGE */}
              <span className="status-badge verified">
                SOLD
              </span>
            </div>

            <button className="options-btn">...</button>
          </div>
        </div>
      ))
    )}
  </div>
</section>


          {/* Column 4: Added Crops (Grid) */}
          <section className="added-crops-column">
            <h1 className="section-label">
            ADDED CROP {addedCrops.some(c => c.status==="verified") ? "(some verified)" : "(Non-verified)"}
          </h1>
            <div className="crops-grid">
              {addedCrops
  /* server already returns only this farmer's products; filter by id just in case */
  .filter(crop => {
    const farmerId = crop.farmer && crop.farmer.toString ? crop.farmer.toString() : crop.farmer;
    return farmerId === loggedInUserId;
  })
  .map((crop) => (
                     <div key={crop._id} className="crop-grid-item">
                         {crop.image ? (
                           // only render images; if filename is not an image, show link
                           /\.(jpe?g|png|gif|webp|bmp)$/i.test(crop.image) ? (
                             <img
                               src={`http://localhost:5000/uploads/licenses/${crop.image}`}
                               alt="Crop"
                             />
                           ) : (
                             <a
                               href={`http://localhost:5000/uploads/licenses/${crop.image}`}
                               target="_blank"
                               rel="noopener noreferrer"
                             >
                               View file
                             </a>
                           )
                         ) : (
                           <div className="no-image">No image</div>
                         )}

                      <div className="crop-grid-details">
                          <div>
                       <strong>{crop.variety}</strong>
                       <p>₹ {crop.price}</p>
                       <p>Added Quantity: ₹ {crop.quantity}</p>
                       {/* STATUS BADGE placed here below image/details */}
                       {crop.status && (
                         <span className={`status-badge ${crop.status}`}>{crop.status.toUpperCase()}</span>
                       )}
                       </div>

                      <button className="options-btn">...</button>
                  </div>
                  </div>
               ))}

            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default FarmerDashboard;