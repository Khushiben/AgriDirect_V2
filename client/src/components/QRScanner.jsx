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
              fps: 10,
              qrbox: 250,
              rememberLastUsedCamera: true,
              aspectRatio: 1.0,
              disableFlip: false,
              videoConstraints: {
                facingMode: "environment"
              }
            },
            false
          );

          scanner.render(
            (decodedText) => {
              console.log("QR Code detected:", decodedText);
              try {
                const data = JSON.parse(decodedText);
                console.log("Parsed QR data:", data);
                stopScanning();
                onScanSuccess(data);
              } catch (err) {
                console.error('QR parse error:', err);
                setError('Invalid QR code format. Please scan a valid product QR code.');
              }
            },
            (errorMessage) => {
              // Silently handle scanning errors
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
    if (!file) return;

    setError('');
    const html5QrCode = new Html5Qrcode("qr-reader");
    
    html5QrCode.scanFile(file, true)
      .then(decodedText => {
        try {
          const data = JSON.parse(decodedText);
          onScanSuccess(data);
          onClose();
        } catch (err) {
          console.error('QR parse error:', err);
          setError('Invalid QR code format. This doesn\'t appear to be a valid product QR code.');
        }
      })
      .catch(err => {
        console.error('File scan error:', err);
        setError('No QR code found in the uploaded image. Please try a different image.');
      })
      .finally(() => {
        html5QrCode.clear();
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
