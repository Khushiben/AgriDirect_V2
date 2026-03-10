import React, { useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import '../styles/QRScanner.css';

const QRScanner = ({ onScanSuccess, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);

  const startScanning = async () => {
    setScanning(true);
    setError('');

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ video: true });
          
          const scanner = new Html5QrcodeScanner(
            "qr-reader",
            {
              fps: 30, // Increased from 10 to 30 for faster detection
              qrbox: { width: 300, height: 300 }, // Larger scan box
              rememberLastUsedCamera: true,
              aspectRatio: 1.0,
              disableFlip: false,
              videoConstraints: {
                facingMode: "environment",
                advanced: [{ zoom: 1.0 }]
              },
              // Enable full frame scanning - no box restriction
              experimentalFeatures: {
                useBarCodeDetectorIfSupported: true
              },
              showTorchButtonIfSupported: true,
              formatsToSupport: [0] // QR_CODE only for faster detection
            },
            false
          );

          scanner.render(
            (decodedText) => {
              console.log("✅ QR Code detected:", decodedText);
              try {
                const data = JSON.parse(decodedText);
                console.log("✅ Parsed QR data successfully:", data);
                console.log("📦 Product variety:", data.variety || data.varietyName);
                console.log("👨‍🌾 Farmer:", data.farmerName || data.farmer);
                console.log("🚚 Distributor:", data.distributorName || data.distributor);
                console.log("🏪 Retailer:", data.retailerName || data.retailer);
                console.log("🎯 Calling onScanSuccess callback...");
                stopScanning();
                onScanSuccess(data);
                console.log("✅ onScanSuccess callback completed");
              } catch (err) {
                console.error('❌ QR parse error:', err);
                console.error('❌ Raw QR text:', decodedText);
                setError('Invalid QR code format. Please scan a valid product QR code.');
              }
            },
            (errorMessage) => {
              // Silently handle scanning errors (too noisy)
            }
          );

          scannerInstanceRef.current = scanner;
        } catch (permissionError) {
          console.error('Camera permission error:', permissionError);
          setError('Camera access denied. Please allow camera permissions in your browser settings and try again.');
          setScanning(false);
        }
      } else {
        setError('Camera not supported on this device. Please use the file upload option instead.');
        setScanning(false);
      }
    } catch (err) {
      console.error('Scanner initialization error:', err);
      setError('Failed to initialize scanner. Please try uploading an image instead.');
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
    console.log("📁 File selected:", file);
    
    if (!file) {
      console.log("❌ No file selected");
      return;
    }

    setError('');
    console.log("🔄 Starting QR scan from file...");
    console.log("📄 File details:", {
      name: file.name,
      type: file.type,
      size: file.size
    });
    
    const html5QrCode = new Html5Qrcode("qr-reader");
    
    html5QrCode.scanFile(file, true)
      .then(decodedText => {
        console.log("✅ QR Code scanned from file:", decodedText);
        console.log("📏 Decoded text length:", decodedText.length);
        
        try {
          const data = JSON.parse(decodedText);
          console.log("✅ Parsed QR data successfully:", data);
          console.log("📦 Product variety:", data.v || data.variety);
          console.log("👨‍🌾 Farmer:", data.f || data.farmerName || data.farmer);
          console.log("🚚 Distributor:", data.d || data.distributorName || data.distributor);
          console.log("🏪 Retailer:", data.r || data.retailerName || data.retailer);
          console.log("🎯 Calling onScanSuccess callback...");
          
          // Clean up first
          html5QrCode.clear().catch(err => console.log("Clear error (ignore):", err));
          
          // Call callbacks
          onScanSuccess(data);
          console.log("✅ onScanSuccess callback completed");
          
          // Small delay before closing to ensure state updates
          setTimeout(() => {
            onClose();
            console.log("✅ onClose callback completed");
          }, 100);
          
        } catch (err) {
          console.error('❌ QR parse error:', err);
          console.error('❌ Raw QR text:', decodedText);
          setError('Invalid QR code format. This doesn\'t appear to be a valid product QR code.');
          html5QrCode.clear().catch(e => console.log("Clear error:", e));
        }
      })
      .catch(err => {
        console.error('❌ File scan error:', err);
        console.error('❌ Error details:', {
          message: err.message,
          name: err.name,
          stack: err.stack
        });
        
        // More helpful error messages
        if (err.name === 'NotFoundException') {
          setError('No QR code found in this image. Please ensure:\n• The image contains a clear QR code\n• The QR code is not blurry or damaged\n• Try taking a new photo with better lighting');
        } else {
          setError('Failed to scan QR code. Please try a different image or take a new photo.');
        }
        
        html5QrCode.clear().catch(e => console.log("Clear error:", e));
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
                <p>✨ Point camera at QR code - it will auto-detect anywhere in frame</p>
                <p style={{ fontSize: '0.9em', opacity: 0.8 }}>No need to center it perfectly!</p>
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
