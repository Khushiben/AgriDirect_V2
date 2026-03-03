import "../styles/Footer.css";
const Footer = () => {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-logo">
          <video autoPlay loop muted playsInline>
            <source src="/logo.mp4" type="video/mp4" />
          </video>
          <span>AgriDirect</span>
        </div>

        <div className="footer-contact">
          <h3>Contact Us</h3>
          <p>Email: support@agriDirect.com</p>
          <p>Phone: +91 10101 01010</p>
        </div>

        <div className="footer-social">
          <h3>Follow Us</h3>
          <a href="#">
            <img src="/linkedin.png" alt="LinkedIn" />
          </a>
          <a href="#">
            <img src="/twitter.png" alt="Twitter" />
          </a>
          <a href="#">
            <img src="/instagram.png" alt="Instagram" />
          </a>
          <a href="#">
            <img src="/youtube.png" alt="YouTube" />
          </a>
        </div>
      </div>

      <p className="footer-copy">
        © 2025 Agridirect. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;