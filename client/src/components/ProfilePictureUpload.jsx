import React, { useState, useRef } from 'react';
import axios from 'axios';
import './ProfilePictureUpload.css';

const ProfilePictureUpload = ({ currentPicture, onUpload, userId }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(currentPicture || null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Upload file
      uploadPicture(file);
    }
  };

  const uploadPicture = async (file) => {
    setIsUploading(true);
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await axios.post(
        'http://localhost:5000/api/profile/upload-picture',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Profile picture uploaded:', response.data);
      onUpload(response.data.profilePicture);
      setIsEditing(false);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    fileInputRef.current?.click();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPreview(currentPicture || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="profile-picture-upload">
      <div className="profile-picture-container">
        <div className="profile-picture-wrapper">
          {preview ? (
            <img 
              src={preview.startsWith('data:') ? preview : `http://localhost:5000/api/profile/pictures/${preview}`}
              alt="Profile" 
              className="profile-picture"
            />
          ) : (
            <div className="profile-picture-placeholder">
              <span className="profile-picture-icon">👤</span>
            </div>
          )}
          
          {isUploading && (
            <div className="upload-overlay">
              <div className="upload-spinner">⏳</div>
            </div>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        {!isUploading && (
          <button 
            className="edit-picture-btn"
            onClick={handleEditClick}
            title="Change profile picture"
          >
            📷
          </button>
        )}
        
        {isEditing && (
          <button 
            className="cancel-edit-btn"
            onClick={handleCancel}
            title="Cancel"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfilePictureUpload;
