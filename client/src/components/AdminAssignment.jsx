import React, { useState, useEffect } from 'react';
import '../styles/AdminAssignment.css';

const AdminAssignment = ({ onProductAssigned, currentAdmin }) => {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [assignedProducts, setAssignedProducts] = useState([]);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mandiData, setMandiData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock mandi data (in real app, this would come from API)
  const mockMandiData = {
    'Basmati': { minPrice: 4500, maxPrice: 5500, avgPrice: 5000, trend: 'up' },
    'Non-Basmati': { minPrice: 3500, maxPrice: 4200, avgPrice: 3850, trend: 'stable' },
    'Sona Masoori': { minPrice: 4000, maxPrice: 4800, avgPrice: 4400, trend: 'up' },
    'Ponni': { minPrice: 3800, maxPrice: 4500, avgPrice: 4150, trend: 'down' }
  };

  useEffect(() => {
    // Simulate receiving new products that need admin assignment
    const checkForNewProducts = () => {
      // In real app, this would be an API call
      const mockNewProducts = [
        {
          id: '1',
          variety: 'Basmati Rice',
          farmerName: 'John Farmer',
          initialPrice: 4800,
          quantity: 500,
          status: 'pending_assignment'
        }
      ];
      
      if (mockNewProducts.length > 0) {
        setPendingProducts(mockNewProducts);
        setShowAssignmentModal(true);
      }
    };

    checkForNewProducts();
  }, []);

  const assignRandomAdmin = (product) => {
    const admins = ['admin1@agri.com', 'admin2@agri.com', 'admin3@agri.com'];
    const randomAdmin = admins[Math.floor(Math.random() * admins.length)];
    
    return randomAdmin;
  };

  const handleProductAssignment = (product) => {
    setLoading(true);
    
    // Get mandi data for the product variety
    const riceType = product.variety.includes('Basmati') ? 'Basmati' : 
                    product.variety.includes('Sona') ? 'Sona Masoori' : 
                    product.variety.includes('Ponni') ? 'Ponni' : 'Non-Basmati';
    
    const relevantMandiData = mockMandiData[riceType] || mockMandiData['Non-Basmati'];
    
    setTimeout(() => {
      const assignedAdmin = assignRandomAdmin(product);
      
      const updatedProduct = {
        ...product,
        assignedTo: assignedAdmin,
        mandiData: relevantMandiData,
        lockedInitialPrice: product.initialPrice,
        status: 'assigned'
      };
      
      setAssignedProducts(prev => [...prev, updatedProduct]);
      setPendingProducts(prev => prev.filter(p => p.id !== product.id));
      
      onProductAssigned(updatedProduct);
      setShowAssignmentModal(false);
      setSelectedProduct(null);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="admin-assignment-container">
      <h3>🎯 Product Assignment System</h3>
      
      {/* Assignment Queue */}
      <div className="assignment-queue">
        <h4>Products Pending Assignment</h4>
        {pendingProducts.length === 0 ? (
          <p className="empty-state">No products pending assignment</p>
        ) : (
          <div className="pending-products">
            {pendingProducts.map(product => (
              <div key={product.id} className="pending-product-card">
                <div className="product-info">
                  <h5>{product.variety}</h5>
                  <p>Farmer: {product.farmerName}</p>
                  <p>Initial Price: ₹{product.initialPrice}</p>
                  <p>Quantity: {product.quantity}kg</p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedProduct(product);
                    handleProductAssignment(product);
                  }}
                  className="assign-btn"
                  disabled={loading}
                >
                  {loading ? 'Assigning...' : 'Assign Random Admin'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignmentModal && selectedProduct && (
        <div className="assignment-modal-overlay">
          <div className="assignment-modal">
            <h3>🔄 Assigning Product to Admin</h3>
            <div className="assignment-animation">
              <div className="loading-spinner"></div>
              <p>Finding available admin...</p>
            </div>
            
            {mandiData && (
              <div className="mandi-info">
                <h4>📊 Current Mandi Data</h4>
                <div className="mandi-stats">
                  <div className="stat">
                    <span className="label">Min Price:</span>
                    <span className="value">₹{mandiData.minPrice}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Max Price:</span>
                    <span className="value">₹{mandiData.maxPrice}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Avg Price:</span>
                    <span className="value">₹{mandiData.avgPrice}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Trend:</span>
                    <span className={`value trend ${mandiData.trend}`}>
                      {mandiData.trend === 'up' ? '📈' : mandiData.trend === 'down' ? '📉' : '➡️'} 
                      {mandiData.trend}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assigned Products History */}
      <div className="assigned-history">
        <h4>Recent Assignments</h4>
        {assignedProducts.length === 0 ? (
          <p className="empty-state">No products assigned yet</p>
        ) : (
          <div className="assigned-products">
            {assignedProducts.map(product => (
              <div key={product.id} className="assigned-product-card">
                <div className="product-details">
                  <h5>{product.variety}</h5>
                  <p>Assigned to: <strong>{product.assignedTo}</strong></p>
                  <p>Locked Initial Price: ₹{product.lockedInitialPrice}</p>
                  <div className="price-range">
                    <span>Admin Range: ₹{product.mandiData.minPrice} - ₹{product.mandiData.maxPrice}</span>
                  </div>
                </div>
                <div className="status-badge assigned">
                  ✓ Assigned
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAssignment;
