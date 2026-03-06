import "../styles/AddProduct.css";
import React, { useState, useEffect } from "react";
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
  const today = new Date();
  const threeMonthsLater = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
  
  const formatDate = (date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format for HTML date inputs
  };

  const [formData, setFormData] = useState({
    riceType: "Raw Rice",
    category: "Non-Basmati",
    variety: "Sona Masuri (BPT 5204)",
    season: "Kharif",
    sowingDate: formatDate(today),
    harvestDate: formatDate(threeMonthsLater),
    quantity: "500",
    price: "", // Start empty - will be set after mandi prices load
    negotiable: "Yes",
    soilType: "Alluvial",
    irrigationType: "Canal",
    seedSource: "Government Certified",
    privateCompany: "",
    fertilizer: "Urea",
    fertilizerQty: "50",
    applications: "2",
    lastFertilizerDate: formatDate(today),
    diseaseOccurred: "No",
    pests: [{ pestName: "Stem Borer", pesticide: "Chlorpyrifos", sprays: "2", lastSpray: formatDate(today) }],
    grainLength: "6.5",
    broken: "2",
    moisture: "14",
    color: "White",
    foreignMatter: "0.5",
    damaged: "1",
    polishing: "Single",
    aging: "Fresh",
    location: "Anand, India",
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();

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
    // ✅ Create FormData object
    const data = new FormData();

    // Append all fields except image
    Object.keys(formData).forEach((key) => {
      if (key === "pests") {
        data.append("pests", JSON.stringify(formData.pests)); 
      } 
      else if (key !== "image") {
        data.append(key, formData[key]);
      }
    });
    data.append("farmerId", storedUser.userId);

    // ✅ Append image separately
    if (formData.image) {
      data.append("image", formData.image);
    }

    const token = localStorage.getItem("token");
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

  // Field options for AI assistant (list options / set value)
  const fieldOptions = {
    location: ["Anand, India"],
    riceType: ["Raw Rice", "Parboiled Rice", "Brown Rice", "Sella Rice"],
    category: ["Basmati", "Non-Basmati"],
    variety: ["Basmati Rice (1121 & Pusa)", "Parboiled Rice", "Wada Kolam", "Sona Masuri (BPT 5204)", "Indrayani", "Gujarat Rice 17 (GR-17)"],
    season: ["Kharif", "Rabi"],
    negotiable: ["Yes", "No"],
    soilType: ["Alluvial", "Clay-Black", "Red"],
    irrigationType: ["Canal", "Borewell", "Rainfed", "Drip"],
    seedSource: ["Government Certified", "Private Company"],
    fertilizer: ["Urea", "DAP", "NPK", "Organic Compost", "Vermicompost"],
    diseaseOccurred: ["Yes", "No"],
    color: ["White", "Cream", "Golden"],
    polishing: ["Single", "Double", "Silky"],
    aging: ["Fresh", "6 Months", "1+ Year"],
  };


  return (

    <div className="add-product-container">
      <form className="full-page-form" onSubmit={handleSubmit}>
        <h1 style={{textAlign: "center",color:"green"}}>-: Add New Product :-</h1>
        <h2 className="section-title">Farm Location</h2>
        
        <div className="location-section">
          <div className="location-input">
            <label>Farmer Location</label>
            <input
              id="location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              readOnly
              style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
            />
            <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
              📍 Location is automatically set to Anand, India for demo purposes
            </small>
          </div>
          
          <div className="map-container">
            <label>Farm Location Map</label>
            <FarmMap height="250px" />
            <small style={{ color: '#666', display: 'block', marginTop: '5px', textAlign: 'center' }}>
              � Akshar Farm, Anand, GWXW+93V, Akshar Farm Rd, Vivekanand Wadi, Anand, Gujarat 388120
            </small>
          </div>
        </div>

        <h2 className="section-title">Prior Details</h2>
      
 <div className="grid-3">
        {/* Rice Type */}<div>
        <label>Rice Type</label>
        <select id="riceType" name="riceType"value={formData.riceType} onChange={handleChange} required>
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
          id="category"
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
         id="variety"
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
        {/* Crop Season */}
        <label>Crop Season</label>
        <select
          id="season"
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
</div>
        {/* Dates row - side by side */}
<div className="input-row">
  <div className="input-half">
    <label>Sowing Date</label>
    <input
      id="sowingDate"
      type="date"
      name="sowingDate"
      value={formData.sowingDate}
      onChange={handleChange}
      required
    />
  </div>
  <div className="input-half">
    <label>Harvest Date</label>
    <input
      id="harvestDate"
      type="date"
      name="harvestDate"
      value={formData.harvestDate}
      onChange={handleChange}
      required
    />
  </div>
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
            <select id="soilType" name="soilType" value={formData.soilType} onChange={handleChange} required>
              <option value="">Select</option>
              <option>Alluvial</option>
              <option>Clay-Black</option>
              <option>Red</option>
            </select>
          </div>

          <div>
            <label>Irrigation Type</label>
            <select id="irrigationType" name="irrigationType" value={formData.irrigationType} onChange={handleChange} required>
              <option value="">Select</option>
              <option>Canal</option>
              <option>Borewell</option>
              <option>Rainfed</option>
              <option>Drip</option>
            </select>
          </div>

          <div>
            <label>Seed Source</label>
            <select id="seedSource" name="seedSource" value={formData.seedSource} onChange={handleChange} required>
              <option value="">Select</option>
              <option>Government Certified</option>
              <option>Private Company</option>
            </select>
          </div>

          {formData.seedSource === "Private Company" && (
            <div>
              <label>Private Company Name</label>
              <input id="privateCompany" type="text" name="privateCompany" onChange={handleChange} required />
            </div>
          )}

          <div>
            <label>Fertilizer Used</label>
            <select id="fertilizer" name="fertilizer" value={formData.fertilizer} onChange={handleChange}>
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
            <input id="fertilizerQty" type="number" name="fertilizerQty" value={formData.fertilizerQty} onChange={handleChange} />
          </div>

          <div>
            <label>No. of Applications</label>
            <input id="applications" type="number" name="applications" value={formData.applications} onChange={handleChange} />
          </div>

          <div>
            <label>Last Application Date</label>
            <input id="lastFertilizerDate" type="date" name="lastFertilizerDate" value={formData.lastFertilizerDate} onChange={handleChange} />
          </div>

        </div>

        <h2 className="section-title">Pest & Disease Details</h2>

        <div className="grid-3">

          <div>
            <label>Disease Occurred?</label>
            <select
              id="diseaseOccurred"
              value={formData.diseaseOccurred}
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

          <input id="grainLength" type="number" placeholder="Grain Length (mm)" name="grainLength" value={formData.grainLength} onChange={handleChange} />
          <input id="broken" type="number" placeholder="Broken (%)" name="broken" value={formData.broken} onChange={handleChange} />
          <input id="moisture" type="number" placeholder="Moisture (%)" name="moisture" value={formData.moisture} onChange={handleChange} />

          <select id="color" name="color" value={formData.color} onChange={handleChange}>
            <option value="">Color</option>
            <option>White</option>
            <option>Cream</option>
            <option>Golden</option>
          </select>

          <input id="foreignMatter" type="number" placeholder="Foreign Matter (%)" name="foreignMatter" value={formData.foreignMatter} onChange={handleChange} />
          <input id="damaged" type="number" placeholder="Damaged Grains (%)" name="damaged" value={formData.damaged} onChange={handleChange} />

          <select id="polishing" name="polishing" value={formData.polishing} onChange={handleChange}>
            <option value="">Polishing Level</option>
            <option>Single</option>
            <option>Double</option>
            <option>Silky</option>
          </select>

          <select id="aging" name="aging" value={formData.aging} onChange={handleChange}>
            <option value="">Aging</option>
            <option>Fresh</option>
            <option>6 Months</option>
            <option>1+ Year</option>
          </select>

        </div>

        <button type="submit" className="submit-btn">Submit Product</button>

      </form>
      
      {/* AI Voice Assistant */}
      <VoiceAssistantErrorBoundary>
        <VoiceAssistantSafe availableFields={availableFields} fieldOptions={fieldOptions} />
      </VoiceAssistantErrorBoundary>
    </div>
  );
}
