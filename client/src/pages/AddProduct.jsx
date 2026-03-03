import "../styles/AddProduct.css";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export default function AddProduct() {
const [pestCount, setPestCount] = useState(0);
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
<div>
        {/* Quantity */}
        <label>Available Quantity (in kg)</label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          required
        />
</div><div>
        {/* Price */}
        <label>Price per Quintal (₹)</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
        />
</div><div>
        {/* Negotiable */}
        <label>Is Price Negotiable?</label>
        <select
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
