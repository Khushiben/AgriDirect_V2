import "../styles/Home.css";
import { useState } from "react";
import QRScanner from "../components/QRScanner";
import ProductTraceability from "../components/ProductTraceability";

const Home = () => {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showTraceability, setShowTraceability] = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);

  const handleQRScanSuccess = (productData) => {
    console.log("🎉 HOME: QR Scan Success! Product data received:", productData);
    setScannedProduct(productData);
    setShowQRScanner(false);
    setShowTraceability(true);
    console.log("🎉 HOME: Traceability modal should now be visible");
  };

  const closeQRScanner = () => {
    setShowQRScanner(false);
  };

  const closeTraceability = () => {
    setShowTraceability(false);
    setScannedProduct(null);
  };
  return (
    <>
      <div className="vertical-border left"></div>
      <div className="vertical-border right"></div>

      <section className="hero">
        <h1>Connecting Natural Farmers & Conscious Consumers</h1>
        <p>Buy directly from verified farmers with full product traceability.</p>
        
        <div className="hero-buttons">
          <button className="cta-button" onClick={() => {
              const storedUser = JSON.parse(localStorage.getItem("user"));
              if (storedUser) {
                window.location.href = `/${storedUser.role}/dashboard`;
              } else {
                window.location.href = "/login";
              }
            }}>
            Explore Marketplace
          </button>
          
          <button className="qr-scanner-button" onClick={() => setShowQRScanner(true)}>
            📱 Scan QR Code
          </button>
        </div>
        
        <p className="qr-hint">
          Scan any product QR code to verify authenticity and trace its complete journey from farm to table
        </p>
      </section>

      <section className="mission">
        <img src="/farmer1.png" alt="Farming Mission" />
        <div className="mission-content">
          <h2>Our Mission & Passion</h2>
          <p>
            At AgriDirect, we empower natural farmers by providing them with an
            independent digital marketplace, free from middlemen.
          </p>
          <p>
            We enable transparent, traceable, and ethical agriculture.
          </p>
          <button className="btn btn-outline-success">Get In Touch</button>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>

        <div className="video-container">
          <video autoPlay loop muted playsInline>
            <source src="/how-it-works.mp4" type="video/mp4" />
          </video>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <h2>Meet Our Team</h2>
        <p className="team-subtitle">Passionate developers building the future of agriculture</p>
        
        <div className="team-grid">
          <div className="team-member">
            <div className="member-photo">
              <img src="https://lh3.googleusercontent.com/pw/AP1GczOvuNtuzKh0y0g34IR8pYJur70XZ5_SVHl1IGrNd6UekjaK0yiRSJT9ej4RR3Q7KqIR9VMoIK98KY_O4BOVvSAcloFMI0yGSA9n1GeYbIzjqWTbz3aNhHUAnkuBT98qpEmmkk1nW9GcCighIPjX8pl7sg=w1109-h724-s-no-gm" alt="Shikha" />
            </div>
            <h3>Shikha</h3>
            <p className="member-role">Full Stack Developer & Owner</p>
            <p className="member-bio">Leading AgriDirect's mission to revolutionize agricultural supply chains through blockchain technology.</p>
          </div>

          <div className="team-member">
            <div className="member-photo">
              <img src="https://lh3.googleusercontent.com/pw/AP1GczNtI2AOUNFoJnGKe7z-eyv1-CFaJKqVpdTcpjm3sf7ZY_1_ssMbepITLE8j-iWymHE6tKHB3I6zIferr0722553K5vkdaAsOQs8WOCK_6f4zvjTZ4h-lrQqUDf2w19PLEO5R3a3SYuqL7k4qm_4zjowOQ=w851-h1013-s-no-gm" alt="Shubham" />
            </div>
            <h3>Shubham</h3>
            <p className="member-role">Full Stack Developer</p>
            <p className="member-bio">Expert in blockchain integration and backend architecture, ensuring secure and transparent transactions.</p>
          </div>

          <div className="team-member">
            <div className="member-photo">
              <img src="https://lh3.googleusercontent.com/pw/AP1GczOcyYJXRJMpyX7ZHOl677hzuGgGXkcO0R6mqdGWi8PSi0INzTlYl66vWRHouhgFYs3n8f6bYigmQjfWrtbxXk3uDJjq3WwR5pDFL9gtu_5m5Cwx_etknVSf8JzCUv9p_VsUk1ORuQQSMgBF5t3-bll2_Q=w663-h1013-s-no-gm" alt="Khushi" />
            </div>
            <h3>Khushi</h3>
            <p className="member-role">Full Stack Developer</p>
            <p className="member-bio">Specializing in user experience and frontend development for seamless platform interactions.</p>
          </div>

          <div className="team-member">
            <div className="member-photo">
              <img src="https://lh3.googleusercontent.com/pw/AP1GczMtgODdf4cxA3GoE6Kqeg2AiidrhY5fyDFJ9nNhNmhnLILFB94ji4ZF9L9g2put6klrvHYwv4hT1O74ZaOZAZbngZUrzFcQr6G5uFm7kNmBcCW2j3gFH9fpGjcDS9aTnpDKkHctH34hFjO_JhMpsoH9Ow=w760-h1013-s-no-gm" alt="Krisha" />
            </div>
            <h3>Krisha</h3>
            <p className="member-role">Full Stack Developer</p>
            <p className="member-bio">Contributing to the development of innovative features for transparent agricultural trade.</p>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <img src="/transparancy.png" alt="Transparency" />
          <h3>Transparency</h3>
          <p>Clear and open transactions.</p>
        </div>

        <div className="feature">
          <img src="/fairtrade.png" alt="Fair Trade" />
          <h3>Fair Trade</h3>
          <p>Equitable growth for farmers.</p>
        </div>

        <div className="feature">
          <img src="/user-friendly.png" alt="User Friendly" />
          <h3>User Friendly</h3>
          <p>Simple, reliable experience.</p>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <h2>Meet Our Team</h2>
        <p className="team-subtitle">Passionate developers building the future of agriculture</p>
        
        <div className="team-grid">
          <div className="team-member">
            <div className="member-photo">
              <img src="https://lh3.googleusercontent.com/pw/AP1GczOvuNtuzKh0y0g34IR8pYJur70XZ5_SVHl1IGrNd6UekjaK0yiRSJT9ej4RR3Q7KqIR9VMoIK98KY_O4BOVvSAcloFMI0yGSA9n1GeYbIzjqWTbz3aNhHUAnkuBT98qpEmmkk1nW9GcCighIPjX8pl7sg=w1109-h724-s-no-gm" alt="Shikha" />
            </div>
            <h3>Shikha</h3>
            <p className="member-role">Full Stack Developer & Owner</p>
            <p className="member-bio">Leading AgriDirect's mission to revolutionize agricultural supply chains through blockchain technology.</p>
          </div>

          <div className="team-member">
            <div className="member-photo">
              <img src="https://lh3.googleusercontent.com/pw/AP1GczNtI2AOUNFoJnGKe7z-eyv1-CFaJKqVpdTcpjm3sf7ZY_1_ssMbepITLE8j-iWymHE6tKHB3I6zIferr0722553K5vkdaAsOQs8WOCK_6f4zvjTZ4h-lrQqUDf2w19PLEO5R3a3SYuqL7k4qm_4zjowOQ=w851-h1013-s-no-gm" alt="Shubham" />
            </div>
            <h3>Shubham</h3>
            <p className="member-role">Full Stack Developer</p>
            <p className="member-bio">Expert in blockchain integration and backend architecture, ensuring secure and transparent transactions.</p>
          </div>

          <div className="team-member">
            <div className="member-photo">
              <img src="https://lh3.googleusercontent.com/pw/AP1GczOcyYJXRJMpyX7ZHOl677hzuGgGXkcO0R6mqdGWi8PSi0INzTlYl66vWRHouhgFYs3n8f6bYigmQjfWrtbxXk3uDJjq3WwR5pDFL9gtu_5m5Cwx_etknVSf8JzCUv9p_VsUk1ORuQQSMgBF5t3-bll2_Q=w663-h1013-s-no-gm" alt="Khushi" />
            </div>
            <h3>Khushi</h3>
            <p className="member-role">Full Stack Developer</p>
            <p className="member-bio">Specializing in user experience and frontend development for seamless platform interactions.</p>
          </div>

          <div className="team-member">
            <div className="member-photo">
              <img src="https://lh3.googleusercontent.com/pw/AP1GczMtgODdf4cxA3GoE6Kqeg2AiidrhY5fyDFJ9nNhNmhnLILFB94ji4ZF9L9g2put6klrvHYwv4hT1O74ZaOZAZbngZUrzFcQr6G5uFm7kNmBcCW2j3gFH9fpGjcDS9aTnpDKkHctH34hFjO_JhMpsoH9Ow=w760-h1013-s-no-gm" alt="Krisha" />
            </div>
            <h3>Krisha</h3>
            <p className="member-role">Full Stack Developer</p>
            <p className="member-bio">Contributing to the development of innovative features for transparent agricultural trade.</p>
          </div>
        </div>
      </section>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner 
          onScanSuccess={handleQRScanSuccess}
          onClose={closeQRScanner}
        />
      )}

      {/* Product Traceability Modal */}
      {showTraceability && scannedProduct && (
        <ProductTraceability 
          productData={scannedProduct}
          onClose={closeTraceability}
        />
      )}
    </>
  );
};

export default Home;