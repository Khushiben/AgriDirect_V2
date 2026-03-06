import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import axios from "axios";
import getCroppedImg from "../utils/cropImage";
import "../styles/SetupProfile.css";

const SetupProfile = () => {
  const navigate = useNavigate();
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const onCropComplete = useCallback((_croppedArea, croppedAreaPx) => {
    setCroppedAreaPixels(croppedAreaPx);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB.");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      setError("Please select and position your photo first.");
      return;
    }
    if (!token) {
      navigate("/login");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels, true);
      const formData = new FormData();
      formData.append("profilePicture", blob, "profile.jpg");

      await axios.post("http://localhost:5000/api/profile/upload-picture", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.message || "Failed to upload. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = () => {
    navigate(`/${user.role}/dashboard`);
  };

  if (!user?.userId) {
    navigate("/login");
    return null;
  }

  return (
    <div className="setup-profile-page">
      <div className="setup-profile-card">
        <h2>Set your profile picture</h2>
        <p className="setup-profile-subtitle">Upload a photo and adjust it in the circle. You can change it later from your dashboard.</p>

        {!imageSrc ? (
          <div className="setup-profile-upload-zone">
            <label className="setup-profile-file-label">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="setup-profile-file-input"
              />
              <span className="setup-profile-file-text">Choose image</span>
            </label>
          </div>
        ) : (
          <>
            <div className="setup-profile-cropper-wrap">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="setup-profile-zoom-label">
              <label>Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="setup-profile-zoom-slider"
              />
            </div>
            <div className="setup-profile-actions">
              <button
                type="button"
                className="setup-profile-btn setup-profile-btn-secondary"
                onClick={() => setImageSrc(null)}
                disabled={uploading}
              >
                Choose another
              </button>
              <button
                type="button"
                className="setup-profile-btn setup-profile-btn-primary"
                onClick={handleSave}
                disabled={uploading}
              >
                {uploading ? "Saving…" : "Save & continue"}
              </button>
            </div>
          </>
        )}

        {error && <p className="setup-profile-error">{error}</p>}

        <button type="button" className="setup-profile-skip" onClick={handleSkip}>
          Skip for now
        </button>
      </div>
    </div>
  );
};

export default SetupProfile;
