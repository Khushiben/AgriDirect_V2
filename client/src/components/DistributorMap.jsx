import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../styles/DistributorMap.css';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const DistributorMap = ({ distributorId }) => {
  const [farmers, setFarmers] = useState([]);
  const [coldStorages, setColdStorages] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [showPriceModal, setShowPriceModal] = useState(false);

  // Mock data for nearby farmers
  const mockFarmers = [
    {
      id: 1,
      name: 'John Farmer',
      email: 'farmer@agri.com',
      location: { lat: 22.5180, lng: 72.8580 },
      products: [
        { variety: 'Basmati Rice', price: 4800, quantity: 500 },
        { variety: 'Sona Masoori', price: 4200, quantity: 300 }
      ]
    },
    {
      id: 2,
      name: 'Sarah Farmer',
      email: 'sarah@agri.com',
      location: { lat: 22.5200, lng: 72.8600 },
      products: [
        { variety: 'Ponni Rice', price: 4500, quantity: 400 },
        { variety: 'Non-Basmati', price: 3800, quantity: 600 }
      ]
    },
    {
      id: 3,
      name: 'Mike Farmer',
      email: 'mike@agri.com',
      location: { lat: 22.5150, lng: 72.8550 },
      products: [
        { variety: 'Basmati Rice', price: 4900, quantity: 350 },
        { variety: 'Jasmine Rice', price: 5200, quantity: 250 }
      ]
    }
  ];

  // Mock cold storage locations
  const mockColdStorages = [
    { id: 1, name: 'Cold Storage A', lat: 22.5180, lng: 72.8580, capacity: 1000, available: 800 },
    { id: 2, name: 'Cold Storage B', lat: 22.5200, lng: 72.8600, capacity: 1000, available: 650 },
    { id: 3, name: 'Cold Storage C', lat: 22.5150, lng: 72.8550, capacity: 1000, available: 900 },
    { id: 4, name: 'Cold Storage D', lat: 22.5250, lng: 72.8650, capacity: 1000, available: 700 }
  ];

  useEffect(() => {
    setFarmers(mockFarmers);
    setColdStorages(mockColdStorages);
  }, []);

  const handleFarmerSelect = (farmer) => {
    setSelectedFarmer(farmer);
    setShowPriceModal(true);
  };

  const createCustomIcon = (type) => {
    return L.divIcon({
      className: 'custom-marker',
      html: type === 'farmer' ? '👨‍🌾' : '🏭',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });
  };

  return (
    <div className="distributor-map-container">
      <h2>🗺️ Nearby Farmers & Cold Storage</h2>
      
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-icon">👨‍🌾</span>
          <span>Farmers</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">🏭</span>
          <span>Cold Storage</span>
        </div>
      </div>

      <div className="map-section">
        <MapContainer 
          center={[22.5180, 72.8580]} 
          zoom={12} 
          style={{ height: '500px', width: '100%', borderRadius: '15px' }}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Farmer Markers */}
          {farmers.map(farmer => (
            <Marker 
              key={farmer.id} 
              position={[farmer.location.lat, farmer.location.lng]}
              icon={createCustomIcon('farmer')}
            >
              <Popup>
                <div className="farmer-popup">
                  <h4>{farmer.name}</h4>
                  <p>📧 {farmer.email}</p>
                  <div className="products-list">
                    <h5>Available Products:</h5>
                    {farmer.products.map((product, idx) => (
                      <div key={idx} className="product-item">
                        <span className="product-name">{product.variety}</span>
                        <span className="product-price">₹{product.price}/kg</span>
                        <span className="product-quantity">{product.quantity}kg</span>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => handleFarmerSelect(farmer)}
                    className="view-products-btn"
                  >
                    View Products & Add Prices
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Cold Storage Markers */}
          {coldStorages.map(storage => (
            <Marker 
              key={storage.id} 
              position={[storage.lat, storage.lng]}
              icon={createCustomIcon('storage')}
            >
              <Popup>
                <div className="storage-popup">
                  <h4>{storage.name}</h4>
                  <p>📊 Capacity: {storage.capacity} kg</p>
                  <p>✅ Available: {storage.available} kg</p>
                  <div className="capacity-bar">
                    <div 
                      className="capacity-fill"
                      style={{ width: `${((storage.capacity - storage.available) / storage.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Farmers List */}
      <div className="farmers-list">
        <h3>👨‍🌾 Nearby Farmers</h3>
        <div className="farmers-grid">
          {farmers.map(farmer => (
            <div key={farmer.id} className="farmer-card">
              <div className="farmer-header">
                <h4>{farmer.name}</h4>
                <span className="farmer-distance">~2.5 km away</span>
              </div>
              <div className="farmer-products">
                {farmer.products.map((product, idx) => (
                  <div key={idx} className="product-info">
                    <span className="product-variety">{product.variety}</span>
                    <span className="product-details">
                      ₹{product.price}/kg • {product.quantity}kg available
                    </span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => handleFarmerSelect(farmer)}
                className="select-farmer-btn"
              >
                Select Farmer
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Price Modal */}
      {showPriceModal && selectedFarmer && (
        <div className="price-modal-overlay">
          <div className="price-modal">
            <h3>💰 Set Processing Prices</h3>
            <div className="farmer-info">
              <h4>{selectedFarmer.name}</h4>
              <p>{selectedFarmer.email}</p>
            </div>
            
            <div className="products-pricing">
              <h5>Products & Pricing</h5>
              {selectedFarmer.products.map((product, idx) => (
                <div key={idx} className="product-pricing-card">
                  <div className="product-header">
                    <span className="product-name">{product.variety}</span>
                    <span className="locked-price">🔒 ₹{product.price}/kg (Farmer's price)</span>
                  </div>
                  
                  <div className="price-inputs">
                    <div className="price-input-group">
                      <label>Washing Cost:</label>
                      <input type="number" placeholder="₹/kg" min="0" />
                    </div>
                    <div className="price-input-group">
                      <label>Processing Cost:</label>
                      <input type="number" placeholder="₹/kg" min="0" />
                    </div>
                    <div className="price-input-group">
                      <label>Packaging Cost:</label>
                      <input type="number" placeholder="₹/kg" min="0" />
                    </div>
                    <div className="price-input-group">
                      <label>Transportation Cost:</label>
                      <input type="number" placeholder="₹/kg" min="0" />
                    </div>
                    <div className="price-input-group">
                      <label>Your Margin:</label>
                      <input type="number" placeholder="₹/kg" min="0" />
                    </div>
                  </div>
                  
                  <div className="total-price">
                    <span>Total Price: </span>
                    <span className="total-amount">₹{product.price + 200}/kg</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="modal-actions">
              <button onClick={() => setShowPriceModal(false)} className="cancel-btn">
                Cancel
              </button>
              <button className="submit-prices-btn">
                Submit Prices & Add to Marketplace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributorMap;
