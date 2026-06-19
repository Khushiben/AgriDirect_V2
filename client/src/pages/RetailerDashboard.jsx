import "../styles/RetailerDashboard.css";

const RetailerDashboard = () => {
  return (
    <div className="retailer-dashboard">
      <h1>🏪 Retailer Dashboard</h1>
<<<<<<< HEAD
=======

      <div className="dashboard-section">
        <center><h2>🛒 Purchased from Distributor</h2></center>

        <div className="crops-grid">
          {purchases.length === 0 && <p>No purchases yet.</p>}

          {purchases.map((p) => (
            <div key={p._id} className="crop-grid-item">
              <div className="crop-grid-details">

                <img
                  src={p.product?.image || `https://images.unsplash.com/photo-1511735643442-503bb3bd348a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y3JvcHxlbnwwfHwwfHx8MA%3D%3D/327x154/?${p.product?.variety || "farm,crop"}`}
                  alt={p.variety || "Rice"}
                  className="crop-image"
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }}
                />

                <strong>{p.variety}</strong>

                <p>Distributor: {p.distributorName}</p>

                <p>Price: ₹ {p.pricePerKg} / kg</p>

                <p>Quantity: {p.quantity} kg</p>

                <p>Total Paid: ₹ {p.quantity * p.pricePerKg}</p>

                <span className="status-badge verified">
                  PURCHASED
                </span>

                {/* ✅ NEW BUTTON ADDED */}
                <button
                  className="action-btn buy-btn"
                  style={{ marginTop: "10px" }}
                  onClick={() =>
                    navigate("/retailer-add-product", {
                      state: { product: p }
                    })
                  }
                >
                  Add to Marketplace
                </button>

              </div>
            </div>
          ))}
        </div>
      </div>
>>>>>>> d026356 (dockerize all things,changed some code and final update d version)
    </div>
  );
};

export default RetailerDashboard;
