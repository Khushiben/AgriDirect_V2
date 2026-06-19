import "../styles/AddProduct.css";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import VoiceAssistantSafe from "../components/VoiceAssistantSafe";
import VoiceAssistantErrorBoundary from "../components/VoiceAssistantErrorBoundary";
import FarmMap from "../components/FarmMap";

// Mandi Price Card Component
const MandiCard = ({ district, price, index }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 500); // Staggered delay: 0s, 0.5s, 1s
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div className={`mandi-card ${isVisible ? 'visible' : ''}`}>
      <div className="mandi-card-header">{district}</div>
      <div className="mandi-commodity">{price.commodity} - {price.variety}</div>
      <div className="mandi-price-main">₹{price.modalPrice}/{price.unit}</div>
      <div className="mandi-price-range">Min: ₹{price.minPrice} - Max: ₹{price.maxPrice}</div>
      <div className="mandi-updated">
        Updated: {new Date(price.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  );
};

// Skeleton Loading Card Component
const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-header"></div>
    <div className="skeleton-line short"></div>
    <div className="skeleton-line medium"></div>
    <div className="skeleton-line short"></div>
  </div>
);

// Mandi Prices Section Component with callback support
const MandiPricesSection = ({ onPricesLoaded }) => {
  const [mandiData, setMandiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 

  useEffect(() => {
    const minLoadingTime = 3000;
    const startTime = Date.now();

    const fetchMandiPrices = async () => {
      try {
        console.log("Fetching mandi prices...");
        const response = await axios.get("http://localhost:5000/api/mandi-prices");
        console.log("Mandi API response:", response.data);
        
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, minLoadingTime - elapsed);
        
        setTimeout(() => {
          const data = response.data.data || [];
          console.log("Setting mandi data:", data);
          setMandiData(data);
          setLoading(false);
          // Call the callback when prices are loaded
          if (onPricesLoaded) {
            onPricesLoaded(data);
          }
        }, remainingDelay);
      } catch (err) {
        console.error("Error fetching mandi prices:", err);
        setError(err.message);
        setTimeout(() => {
          setLoading(false);
        }, minLoadingTime);
      }
    };

    fetchMandiPrices();
  }, [onPricesLoaded]);

  if (loading) {
    return (
      <div className="mandi-prices-section">
        <div className="mandi-prices-title">Live Mandi Prices (Rice)</div>
        <div className="mandi-prices-grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mandi-prices-section">
        <div className="mandi-prices-title">Live Mandi Prices (Rice)</div>
        <div className="mandi-error">Error: {error}</div>
      </div>
    );
  }
 

  // Check if we have any prices to show
  const hasPrices = mandiData.some(d => d.prices && d.prices.length > 0);

  if (!hasPrices) {
    return (
      <div className="mandi-prices-section">
        <div className="mandi-prices-title">Live Mandi Prices (Rice)</div>
        <div className="mandi-empty">No rice price data available</div>
      </div>
    );
  }

  return (
    <div className="mandi-prices-section">
      <div className="mandi-prices-title">Live Mandi Prices (Rice)</div>
      <div className="mandi-prices-grid">
        {mandiData
          .flatMap((districtData) => 
            districtData.prices && districtData.prices.length > 0 
              ? districtData.prices.map((price, priceIndex) => ({
                  district: districtData.district,
                  price,
                  index: priceIndex
                }))
              : []
          )
          .slice(0, 3)
          .map((item) => (
            <MandiCard
              key={`${item.district}-${item.price.variety}`}
              district={item.district}
              price={item.price}
              index={item.index}
            />
          ))}
      </div>
    </div>
  );
};

export default function AddProduct() {
const [pestCount, setPestCount] = useState(0);
  const [availableFields, setAvailableFields] = useState([]);
  const [showETHModal, setShowETHModal] = useState(false);
  const [ethTxDetails, setEthTxDetails] = useState(null);
   const [selectedImage, setSelectedImage] = useState(null);
  const today = new Date();
  const threeMonthsLater = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
  
  const formatDate = (date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format for HTML date inputs
  };

  const [formData, setFormData] = useState({
    riceType: "",
    category: "",
    variety: "",
    season: "",
    sowingDate: "",
    harvestDate: "",
    quantity: "",
    price: "",
    negotiable: "",
    soilType: "",
    irrigationType: "",
    seedSource: "",
    privateCompany: "",
    fertilizer: "",
    fertilizerQty: "",
    applications: "",
    lastFertilizerDate: "",
    diseaseOccurred: "",
    pests: [],
    grainLength: "",
    broken: "",
    moisture: "",
    color: "",
    foreignMatter: "",
    damaged: "",
    polishing: "",
    aging: "",
    image: null 
  });

  //pest data

   const handlePestChange = (index, field, value) => {
    const updated = [...formData.pests];
    updated[index][field] = value;
    setFormData({ ...formData, pests: updated });
  };

  const generatePests = (count) => {
    let arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({ pestName: "", pesticide: "", sprays: "", lastSpray: "" });
    }
    setFormData({ ...formData, pests: arr });
    setPestCount(count);
  };

  // Detect available form fields for AI assistant
  useEffect(() => {
    const fields = [];
    const inputs = document.querySelectorAll('input[name], select[name]');
    inputs.forEach(input => {
      if (input.name && input.type !== 'file') {
        fields.push(input.name);
      }
    });
    setAvailableFields(fields);
  }, []);

  // Track mandi prices loading state
  const [mandiPricesLoaded, setMandiPricesLoaded] = useState(false);
  const [priceSet, setPriceSet] = useState(false);

  // Handle when mandi prices are loaded
  const handleMandiPricesLoaded = (data) => {
    setMandiPricesLoaded(true);
    
    // Calculate average from the loaded prices and convert from quintal to kg (1 quintal = 100 kg)
    const allPrices = data.flatMap(d => d.prices || []);
    if (allPrices.length > 0) {
      const avgQuintalPrice = Math.round(allPrices.reduce((sum, p) => sum + p.modalPrice, 0) / allPrices.length);
      const avgKgPrice = (avgQuintalPrice / 100).toFixed(2); // Convert to per kg with 2 decimals
      
      // Wait 1 second after mandi cards appear, then set price ONCE
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          price: avgKgPrice.toString()
        }));
        setPriceSet(true);
      }, 1000);
    }
  };

    const handleImageChange = (e) => {
  setSelectedImage(e.target.files[0]);
};
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

 
const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  let imageUrl = "";
  if (selectedImage) {
  const imgData = new FormData();
  imgData.append("image", selectedImage);
console.log("Sending image:", imageUrl);
console.log("Calling upload API...");
  const uploadRes = await axios.post(
    "http://localhost:5000/api/products/upload",
    imgData
  );

  imageUrl = uploadRes.data.imageUrl;
}

  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in to add a product.");
    navigate("/login");
    return;
  }

  if (new Date(formData.harvestDate) <= new Date(formData.sowingDate)) {
    alert("Harvest date must be after sowing date!");
    return;
  }

  try {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    
    
    // Create regular JSON object (no FormData needed)
    const data = {
      ...formData,
      farmerId: storedUser.userId,
      // Use fixed Google Photos rice image
      image: imageUrl || "https://images.unsplash.com/photo-1511735643442-503bb3bd348a?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y3JvcHxlbnwwfHwwfHx8MA%3D%3D/200",

      pests: JSON.stringify(formData.pests)
    };

    const response = await axios.post(
      "http://localhost:5000/api/products/add",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Product Added Successfully!");
    console.log(response.data);

    if (response.data.success) {
      window.location.href = "/farmer/dashboard";
    }

  } catch (error) {
    console.error("Add product error:", error.response || error.message || error);
    alert(
      error.response?.data?.message || "Error adding product. Check the console for details."
    );
  }
};

  const basmatiVarieties = [
  "Basmati Rice (1121 & Pusa)"
];

const nonBasmatiVarieties = [
  "Parboiled Rice",
  "Wada Kolam",
  "Sona Masuri (BPT 5204)",
  "Indrayani",
  "Gujarat Rice 17 (GR-17)"
];


  return (

    <div className="add-product-container">
      <form className="full-page-form" onSubmit={handleSubmit}>
        <h1 style={{textAlign: "center",color:"green"}}>-: Add New Product :-</h1>
        <h2 className="section-title">Prior Details</h2>
      
 <div className="grid-3">
        {/* Rice Type */}<div>
        <label>Rice Type</label>
        <select name="riceType"value={formData.riceType} onChange={handleChange} required>
          <option value="">Select Type</option>
          <option value="Raw Rice">Raw Rice</option>
          <option value="Parboiled Rice">Parboiled Rice</option>
          <option value="Brown Rice">Brown Rice</option>
          <option value="Sella Rice">Sella Rice</option>
        </select>
</div>
        {/* Rice Category */}
        <div>
        <label>Rice Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="">Select Category</option>
          <option value="Basmati">Basmati</option>
          <option value="Non-Basmati">Non-Basmati</option>
        </select>
</div>
<div>
        {/* Rice Variety */}
        <label>Rice Variety</label>
       <select
         name="variety"
         value={formData.variety}
         onChange={handleChange}
         required
        >
          <option value="">Select Variety</option>

          {formData.category === "Basmati" &&
          basmatiVarieties.map((v, i) => (
          <option key={i} value={v}>{v}</option>
         ))}

          {formData.category === "Non-Basmati" &&
          nonBasmatiVarieties.map((v, i) => (
           <option key={i} value={v}>{v}</option>
         ))}
         </select>

</div>
<div className="image-upload-section">
  <label>Upload Product Photo</label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) =>
      setFormData({ ...formData, image: e.target.files[0] })
    }
    required
  />
</div>
<div>
<div className="image-upload-section">
  <label>Upload Crop Image</label>
  
  <input
    type="file"
    accept="image/*"
    onChange={handleImageChange}
  />

  {selectedImage && (
    <div style={{ marginTop: "10px" }}>
      <img
        src={URL.createObjectURL(selectedImage)}
        alt="Preview"
        style={{ width: "200px", borderRadius: "10px" }}
      />
    </div>
  )}
</div>
        {/* Crop Season */}
        <label>Crop Season</label>
        <select
          name="season"
          value={formData.season}
          onChange={handleChange}
          required
        >
          <option value="">Select Season</option>
          <option value="Kharif">Kharif</option>
          <option value="Rabi">Rabi</option>
        </select>
</div>
        {/* Dates in One Line */}
       
  <div>
    
    <label>Sowing Date</label>
    <input
      type="date"
      name="sowingDate"
      value={formData.sowingDate}
      onChange={handleChange}
      required
    />
  </div>
</div>
  <div>
    <label>Harvest Date</label>
    <input
      type="date"
      name="harvestDate"
      value={formData.harvestDate}
      onChange={handleChange}
      required
    />


</div>


{/* Price and Quantity row - side by side */}
<div className="input-row">
  <div className="input-half price-input-container">
    <label>Price per kg (₹)</label>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <input
        id="price"
        type="number"
        name="price"
        value={formData.price}
        onChange={handleChange}
        required
        placeholder={!mandiPricesLoaded ? "Loading mandi prices..." : "Enter price"}
        style={{ 
          width: '100%',
          paddingRight: priceSet ? '110px' : '12px',
          background: priceSet ? 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)' : '#fff',
          borderColor: priceSet ? '#4CAF50' : '#ddd',
          transition: 'all 0.3s ease'
        }}
      />
      {priceSet && (
        <span className="ai-suggestion-badge" style={{ animation: 'aiBadgeSlideIn 0.4s ease-out' }}>
          🤖 AI
        </span>
      )}
    </div>
    <small style={{ 
      color: priceSet ? '#2E7D32' : '#666', 
      fontSize: '11px', 
      display: 'block', 
      marginTop: '4px'
    }}>
      {!mandiPricesLoaded ? '⏳ Loading mandi prices...' : 
       !priceSet ? '🔄 Calculating average...' :
       '✅ Price set from Anand mandi rates (editable)'}
    </small>
  </div>
  <div className="input-half">
    <label>Available Quantity (in kg)</label>
    <input
      id="quantity"
      type="number"
      name="quantity"
      value={formData.quantity}
      onChange={handleChange}
      required
    />
  </div>
</div>

{/* Mandi Prices - 3 boxes side by side */}
<MandiPricesSection onPricesLoaded={handleMandiPricesLoaded} />

<div>
  <label>Is Price Negotiable?</label>
  <select
    id="negotiable"
    name="negotiable"
    value={formData.negotiable}
    onChange={handleChange}
    required
  >
    <option value="">Select Option</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select>
</div>
{/* 2nd section */}
        <h2 className="section-title">Cultivation Details</h2>

        <div className="grid-3">

          <div>
            <label>Soil Type</label>
            <select name="soilType" onChange={handleChange} required>
              <option value="">Select</option>
              <option>Alluvial</option>
              <option>Clay-Black</option>
              <option>Red</option>
            </select>
          </div>

          <div>
            <label>Irrigation Type</label>
            <select name="irrigationType" onChange={handleChange} required>
              <option value="">Select</option>
              <option>Canal</option>
              <option>Borewell</option>
              <option>Rainfed</option>
              <option>Drip</option>
            </select>
          </div>

          <div>
            <label>Seed Source</label>
            <select name="seedSource" onChange={handleChange} required>
              <option value="">Select</option>
              <option>Government Certified</option>
              <option>Private Company</option>
            </select>
          </div>

          {formData.seedSource === "Private Company" && (
            <div>
              <label>Private Company Name</label>
              <input type="text" name="privateCompany" onChange={handleChange} required />
            </div>
          )}

          <div>
            <label>Fertilizer Used</label>
            <select name="fertilizer" onChange={handleChange}>
              <option value="">Select</option>
              <option>Urea</option>
              <option>DAP</option>
              <option>NPK</option>
              <option>Organic Compost</option>
              <option>Vermicompost</option>
            </select>
          </div>

          <div>
            <label>Total Qty per Acre (kg)</label>
            <input type="number" name="fertilizerQty" onChange={handleChange} />
          </div>

          <div>
            <label>No. of Applications</label>
            <input type="number" name="applications" onChange={handleChange} />
          </div>

          <div>
            <label>Last Application Date</label>
            <input type="date" name="lastFertilizerDate" onChange={handleChange} />
          </div>

        </div>

        <h2 className="section-title">Pest & Disease Details</h2>

        <div className="grid-3">

          <div>
            <label>Disease Occurred?</label>
            <select
              onChange={(e) => {
                handleChange(e);
                if (e.target.value === "Yes") generatePests(1);
                else generatePests(0);
              }}
              name="diseaseOccurred"
            >
              <option value="">Select</option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>

          {formData.diseaseOccurred === "Yes" && (
            <div>
              <label>How Many Times?</label>
              <input
                type="number"
                onChange={(e) => generatePests(Number(e.target.value))}
              />
            </div>
          )}

        </div>

        {formData.pests.map((pest, index) => (
          <div key={index} className="pest-box">
            <h4>Pest Entry {index + 1}</h4>

            <div className="grid-4">
              <select onChange={(e) => handlePestChange(index, "pestName", e.target.value)}>
                <option value="">Major Pest</option>
                <option>Brown Plant Hopper</option>
                <option>Stem Borer</option>
                <option>Leaf Folder</option>
                <option>Worm</option>
              </select>

              <input
                type="text"
                placeholder="Pesticide Used"
                onChange={(e) => handlePestChange(index, "pesticide", e.target.value)}
              />

              <input
                type="number"
                placeholder="No. of Sprays"
                onChange={(e) => handlePestChange(index, "sprays", e.target.value)}
              />

              <input
                type="date"
                onChange={(e) => handlePestChange(index, "lastSpray", e.target.value)}
              />
            </div>
          </div>
        ))}

        <h2 className="section-title">Quality Parameters</h2>

        <div className="grid-3">

          <input type="number" placeholder="Grain Length (mm)" name="grainLength" onChange={handleChange} />
          <input type="number" placeholder="Broken (%)" name="broken" onChange={handleChange} />
          <input type="number" placeholder="Moisture (%)" name="moisture" onChange={handleChange} />

          <select name="color" onChange={handleChange}>
            <option value="">Color</option>
            <option>White</option>
            <option>Cream</option>
            <option>Golden</option>
          </select>

          <input type="number" placeholder="Foreign Matter (%)" name="foreignMatter" onChange={handleChange} />
          <input type="number" placeholder="Damaged Grains (%)" name="damaged" onChange={handleChange} />

          <select name="polishing" onChange={handleChange}>
            <option value="">Polishing Level</option>
            <option>Single</option>
            <option>Double</option>
            <option>Silky</option>
          </select>

          <select name="aging" onChange={handleChange}>
            <option value="">Aging</option>
            <option>Fresh</option>
            <option>6 Months</option>
            <option>1+ Year</option>
          </select>

        </div>

        <button type="submit" className="submit-btn">Submit Product</button>

      </form>
    </div>
  );
}
