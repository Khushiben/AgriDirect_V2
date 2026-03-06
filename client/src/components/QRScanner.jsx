import React, { useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import '../styles/QRScanner.css';

const QRScanner = ({ onScanSuccess, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);

  const startScanning = () => {
    setScanning(true);
    setError('');

    try {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          supportedScanTypes: [0] // 0 = Camera scan
        },
        false
      );

      scanner.render(onScanSuccess, (errorMessage) => {
        // Handle scan errors silently
        if (errorMessage.includes('No QR code found')) {
          return;
        }
      });

      scannerInstanceRef.current = scanner;
    } catch (err) {
      console.error('Scanner error:', err);
      setError('Failed to start camera. Please check permissions.');
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (scannerInstanceRef.current) {
      try {
        scannerInstanceRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerInstanceRef.current = null;
    }
    setScanning(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const html5QrCode = new Html5Qrcode("qr-reader");
    
    html5QrCode.scanFile(file, true)
      .then(decodedText => {
        try {
          const data = JSON.parse(decodedText);
          onScanSuccess(data);
        } catch (err) {
          setError('Invalid QR code format');
        }
      })
      .catch(err => {
        setError('No QR code found in image');
      });
  };

  return (
    <div className="qr-scanner-overlay">
      <div className="qr-scanner-modal">
        <div className="qr-scanner-header">
          <h2>📱 Scan Product QR Code</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="qr-scanner-content">
          {!scanning ? (
            <div className="scanner-options">
              <div className="scan-option">
                <h3>📷 Camera Scan</h3>
                <p>Use your camera to scan the QR code</p>
                <button className="btn btn-primary" onClick={startScanning}>
                  Start Camera
                </button>
              </div>

              <div className="scan-option">
                <h3>📁 Upload Image</h3>
                <p>Upload an image containing the QR code</p>
                <label className="btn btn-secondary">
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="scanner-active">
              <div className="scanner-instructions">
                <p>Position the QR code within the frame</p>
                <button className="btn btn-secondary stop-btn" onClick={stopScanning}>
                  Stop Scanning
                </button>
              </div>
              <div id="qr-reader" className="qr-reader"></div>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>⚠️ {error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
