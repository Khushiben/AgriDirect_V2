import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../styles/ColdStorage.css';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const ColdStorage = ({ farmerId }) => {
  const [containers, setContainers] = useState([
    { id: 1, name: 'FrostVault Alpha', lat: 22.5180, lng: 72.8580, capacity: 1000, currentStock: 0, owned: false, price: 45 },
    { id: 2, name: 'ChillHub Prime', lat: 22.5200, lng: 72.8600, capacity: 1000, currentStock: 0, owned: false, price: 67 },
    { id: 3, name: 'IceBox Nexus', lat: 22.5150, lng: 72.8550, capacity: 1000, currentStock: 0, owned: false, price: 42 },
    { id: 4, name: 'CryoStore Elite', lat: 22.5250, lng: 72.8650, capacity: 1000, currentStock: 0, owned: false, price: 58 }
  ]);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState('processing'); // 'processing' or 'success'
  const [stockModal, setStockModal] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [stockAmount, setStockAmount] = useState('');
  const [mapCenter, setMapCenter] = useState([22.5180, 72.8580]);
  const [mapZoom, setMapZoom] = useState(13);
  const [selectedMapContainer, setSelectedMapContainer] = useState(null);

  const handleBuyContainer = async (container) => {
    // Show processing animation first
    setTransactionDetails({
      type: 'purchase',
      containerName: container.name,
      amount: container.price,
      timestamp: new Date().toISOString()
    });

    setTransactionStatus('processing');
    setShowTransactionModal(true);

    // After 2 seconds, show success
    setTimeout(() => {
      setTransactionStatus('success');
      
      // After another 1 second, complete the purchase
      setTimeout(() => {
        setContainers(prev => prev.map(c => 
          c.id === container.id ? { ...c, owned: true } : c
        ));
      }, 1000);
    }, 2000);
  };

  const handleMapClick = (container) => {
    setSelectedMapContainer(container);
    // Zoom out then zoom in to container location
    setMapZoom(10);
    setTimeout(() => {
      setMapCenter([container.lat, container.lng]);
      setMapZoom(15);
    }, 500);
  };

  const getTotalOwnedStorage = () => {
    return containers.filter(c => c.owned).reduce((total, c) => total + c.capacity, 0);
  };

  const getTotalUsedStorage = () => {
    return containers.filter(c => c.owned).reduce((total, c) => total + c.currentStock, 0);
  };

  const handleAddStock = () => {
    if (!stockAmount || !selectedContainer) return;
    
    const amount = parseInt(stockAmount);
    const container = containers.find(c => c.id === selectedContainer.id);
    
    if (container.currentStock + amount > container.capacity) {
      alert('Not enough capacity in container!');
      return;
    }

    setContainers(prev => prev.map(c => 
      c.id === selectedContainer.id 
        ? { ...c, currentStock: c.currentStock + amount }
        : c
    ));
    
    setStockModal(false);
    setStockAmount('');
    setSelectedContainer(null);
  };

  const handleRemoveStock = () => {
    if (!stockAmount || !selectedContainer) return;
    
    const amount = parseInt(stockAmount);
    const container = containers.find(c => c.id === selectedContainer.id);
    
    if (container.currentStock < amount) {
      alert('Not enough stock in container!');
      return;
    }

    setContainers(prev => prev.map(c => 
      c.id === selectedContainer.id 
        ? { ...c, currentStock: c.currentStock - amount }
        : c
    ));
    
    setStockModal(false);
    setStockAmount('');
    setSelectedContainer(null);
  };

  return (
    <div className="cold-storage-container">
      <h2>❄️ Cold Storage Management</h2>

      <div className="storage-layout">
        {/* Map Section - Left Side */}
        <div className="map-section">
          <h3>📍 Cold Storage Locations Near You</h3>
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            style={{ height: '500px', width: '100%', borderRadius: '10px' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {containers.map(container => (
              <Marker 
                key={container.id} 
                position={[container.lat, container.lng]}
                icon={L.divIcon({
                  className: 'custom-marker',
                  html: container.owned ? '�' : '💰',
                  iconSize: [30, 30]
                })}
                eventHandlers={{
                  click: () => handleMapClick(container)
                }}
              >
                <Popup>
                  <div className="popup-content">
                    <h4>{container.name}</h4>
                    <p>Status: {container.owned ? 'Owned' : 'Available'}</p>
                    <p>Capacity: {container.capacity} kg</p>
                    <p>Current Stock: {container.currentStock} kg</p>
                    <p>Price: ₹{container.price}/kg</p>
                    {!container.owned && (
                      <button 
                        onClick={() => handleBuyContainer(container)}
                        className="buy-btn"
                      >
                        Buy for {container.price} ETH
                      </button>
                    )}
                    {container.owned && (
                      <div className="stock-controls">
                        <button 
                          onClick={() => {
                            setSelectedContainer(container);
                            setStockModal(true);
                          }}
                          className="stock-btn"
                        >
                          Manage Stock
                        </button>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Storage Details - Right Side */}
        <div className="storage-details">
          <h3>📦 Storage Containers</h3>

          {selectedMapContainer && (
            <div className="selected-container-details">
              <h4>🏠 {selectedMapContainer.name}</h4>
              <div className="container-info">
                <p><strong>Capacity:</strong> {selectedMapContainer.capacity} kg</p>
                <p><strong>Used:</strong> {selectedMapContainer.currentStock} kg ({((selectedMapContainer.currentStock / selectedMapContainer.capacity) * 100).toFixed(1)}%)</p>
                <p><strong>Price:</strong> ₹{selectedMapContainer.price}/kg</p>
                <p><strong>Status:</strong> {selectedMapContainer.owned ? '✅ Owned' : '💰 Available'}</p>
              </div>
              {!selectedMapContainer.owned && (
                <button 
                  onClick={() => handleBuyContainer(selectedMapContainer)}
                  className="buy-btn large"
                >
                  Buy for {selectedMapContainer.price} ETH
                </button>
              )}
            </div>
          )}

          <div className="container-grid">
            {containers.map(container => {
              const usagePercent = ((container.currentStock / container.capacity) * 100).toFixed(1);
              return (
                <div key={container.id} className={`container-card ${container.owned ? 'owned' : 'available'}`}>
                  <div className="container-header">
                    <h5>{container.name}</h5>
                    <span className={`status ${container.owned ? 'owned' : 'available'}`}>
                      {container.owned ? '✅ Owned' : '💰 Available'}
                    </span>
                  </div>
                  
                  <div className="container-details">
                    <p>📊 Capacity: {container.capacity} kg</p>
                    <p>📦 Stock: {container.currentStock} kg ({usagePercent}%)</p>
                    <p>💰 Price: ₹{container.price}/kg</p>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${usagePercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="container-actions">
                    {!container.owned ? (
                      <button 
                        onClick={() => handleBuyContainer(container)}
                        className="buy-btn"
                      >
                        Buy for {container.price} ETH
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setSelectedContainer(container);
                          setStockModal(true);
                        }}
                        className="stock-btn"
                      >
                        Manage Stock
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="transaction-modal-overlay">
          <div className="transaction-modal">
            {transactionStatus === 'processing' ? (
              <>
                <div className="eth-icon-large rotating">⟠</div>
                <h3>Processing Transaction...</h3>
                <div className="transaction-details">
                  <p><strong>Container:</strong> {transactionDetails?.containerName}</p>
                  <p><strong>Amount:</strong> {transactionDetails?.amount} ETH</p>
                  <p><strong>Status:</strong> <span className="processing-text">⏳ Processing...</span></p>
                </div>
                <div className="loading-spinner"></div>
              </>
            ) : (
              <>
                <div className="eth-icon-large success">⟠</div>
                <h3>Transaction Successful!</h3>
                <div className="transaction-details">
                  <p><strong>Container:</strong> {transactionDetails?.containerName}</p>
                  <p><strong>Amount:</strong> {transactionDetails?.amount} ETH</p>
                  <p><strong>Status:</strong> <span className="success-text">✓ Confirmed</span></p>
                </div>
                <button 
                  className="continue-btn"
                  onClick={() => {
                    setShowTransactionModal(false);
                    setTransactionDetails(null);
                    setTransactionStatus('processing');
                  }}
                >
                  Continue
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Stock Management Modal */}
      {stockModal && selectedContainer && (
        <div className="stock-modal-overlay">
          <div className="stock-modal">
            <h3>📦 Manage Stock - {selectedContainer.name}</h3>
            <div className="stock-info">
              <p>Current Stock: {selectedContainer.currentStock} kg</p>
              <p>Available Capacity: {selectedContainer.capacity - selectedContainer.currentStock} kg</p>
            </div>
            
            <div className="stock-form">
              <label>Amount (kg):</label>
              <input
                type="number"
                value={stockAmount}
                onChange={(e) => setStockAmount(e.target.value)}
                min="1"
                max={selectedContainer.capacity - selectedContainer.currentStock}
              />
              
              <div className="stock-actions">
                <button onClick={handleAddStock} className="add-stock-btn">
                  ➕ Add Stock
                </button>
                <button onClick={handleRemoveStock} className="remove-stock-btn">
                  ➖ Remove Stock
                </button>
                <button onClick={() => setStockModal(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColdStorage;
