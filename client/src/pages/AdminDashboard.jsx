import "../styles/AdminDashboard.css";
import { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
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
console.log("ADMIN RESPONSE:", res.data); 
        setProducts(res.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchAllProducts();
  }, []);

  return (
    <div className="admin-dashboard">
      <h1>🔐 Admin Dashboard</h1>

     <section className="added-crops-column">
  <h1 className="section-label">ALL FARMER CROPS</h1>

  <div className="crops-grid">
    {products.map((crop) => (
      <div key={crop._id} className="crop-grid-item">

        <img
          src={`http://localhost:5000/uploads/licenses/${crop.image}`}
          alt="Crop"
        />

        <div className="crop-grid-details">
          <div>
            <strong>{crop.variety}</strong>
            <p>₹ {crop.price}</p>
            <p>Farmer: {crop.farmer?.name}</p>
          </div>

          <button className="options-btn">...</button>
        </div>

      </div>
    ))}
  </div>
</section>

    </div>
  );
};

export default AdminDashboard;
