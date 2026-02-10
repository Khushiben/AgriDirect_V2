import "../styles/Home.css";

const Home = () => {
  return (
    <>
      <div className="vertical-border left"></div>
      <div className="vertical-border right"></div>

      <section className="hero">
        <h1>Connecting Natural Farmers & Conscious Consumers</h1>
        <p>Buy directly from verified farmers with full product traceability.</p>
        <button className="cta-button">Explore Marketplace</button>
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
    </>
  );
};

export default Home;