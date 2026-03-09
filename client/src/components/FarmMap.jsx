import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Random farm locations in Anand, India
const anandFarmLocations = [
  { name: "Green Valley Farm", lat: 22.5645, lng: 72.9289, description: "Organic rice cultivation" },
  { name: "Shanti Agricultural Farm", lat: 22.5587, lng: 72.9345, description: "Traditional farming methods" },
  { name: "Progressive Farmers Co-op", lat: 22.5712, lng: 72.9223, description: "Cooperative farming community" },
  { name: "Sustainable Agriculture Center", lat: 22.5623, lng: 72.9398, description: "Research and demonstration farm" },
  { name: "Golden Harvest Fields", lat: 22.5765, lng: 72.9256, description: "Premium quality rice production" },
  { name: "Mother Nature Farm", lat: 22.5498, lng: 72.9312, description: "Natural farming practices" },
  { name: "Anand Agricultural Hub", lat: 22.5667, lng: 72.9189, description: "Modern agricultural techniques" },
  { name: "Heritage Rice Farm", lat: 22.5534, lng: 72.9445, description: "Heirloom rice varieties" }
];

const FarmMap = ({ height = '300px', selectedLocation = null }) => {
  const [farmLocation, setFarmLocation] = useState(null);

  useEffect(() => {
    // Select a random farm location on component mount
    const randomIndex = Math.floor(Math.random() * anandFarmLocations.length);
    setFarmLocation(anandFarmLocations[randomIndex]);
  }, []);

  if (!farmLocation) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0', borderRadius: '8px' }}>
        Loading map...
      </div>
    );
  }

  return (
    <div style={{ height, borderRadius: '8px', overflow: 'hidden', border: '2px solid #e0e0e0' }}>
      <MapContainer
        center={[farmLocation.lat, farmLocation.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[farmLocation.lat, farmLocation.lng]}>
          <Popup>
            <div style={{ textAlign: 'center', padding: '5px' }}>
              <strong>{farmLocation.name}</strong><br />
              <small>{farmLocation.description}</small><br />
              <em>Anand, India</em>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default FarmMap;
