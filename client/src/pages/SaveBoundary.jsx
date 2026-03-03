import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

const SaveBoundary = () => {
  const featureGroupRef = useRef(null);

  const handleSave = async () => {
  const layers = featureGroupRef.current?.getLayers();

if (!layers || layers.length === 0) {
  alert("Please draw boundary first!");
  return;
}

let polygonCoords = [];

layers.forEach((layer) => {
  if (layer instanceof L.Polygon) {
    const latlngs = layer.getLatLngs()[0];

    polygonCoords = latlngs.map((latlng) => [
      latlng.lng,
      latlng.lat,
    ]);
  }
});

    if (polygonCoords.length === 0) {
      alert("Please draw boundary first!");
      return;
    }

    const geoJson = {
      type: "Polygon",
      coordinates: [polygonCoords],
    };

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        "http://localhost:5000/api/auth/save-boundary",
        { boundary: geoJson },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Boundary Saved Successfully ✅");
    } catch (error) {
      console.error(error);
      alert("Error saving boundary");
    }
  };

  return (
    <div>
      <h2>Draw Your Farm Boundary</h2>

      <MapContainer
        center={[22.9734, 78.6569]}
        zoom={5}
        style={{ height: "500px" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topright"
            draw={{
              rectangle: false,
              circle: false,
              marker: false,
              polyline: false,
              circlemarker: false,
            }}
          />
        </FeatureGroup>
      </MapContainer>

      <button onClick={handleSave} style={{ marginTop: "20px" }}>
        Save Boundary
      </button>
    </div>
  );
};

export default SaveBoundary;