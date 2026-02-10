import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Header.css";

const Header = () => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    // 🔐 Auth check
    const storedRole = localStorage.getItem("userRole");
    if (storedRole) {
      setIsLoggedIn(true);
      setRole(storedRole);
    }

    // 🌐 Google Translate (unchanged logic)
    if (window.googleTranslateElementInit) return;

    window.googleTranslateElementInit = function () {
      new window.google.translate.TranslateElement(
        { pageLanguage: "en" },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      setIsLoggedIn(false);
      setRole(null);
      navigate("/login");
    }
  };

  return (
    <header>
      <nav>
        <div className="logo">
          <video autoPlay loop muted playsInline>
            <source src="/logo.mp4" type="video/mp4" />
          </video>
          <span className="logo-text">AgriDirect</span>
        </div>

        <ul>
          <li>
            <Link to="/">HOME</Link>
          </li>

          <li>
            <Link to="/marketplace">MARKETPLACE</Link>
          </li>

          {isLoggedIn && (
            <li>
              <Link to="/dashboard">DASHBOARD</Link>
            </li>
          )}

          <li>
            <Link to="/about">ABOUT US</Link>
          </li>

          {!isLoggedIn ? (
            <>
              <li>
                <Link to="/login">LOGIN</Link>
              </li>

              <li>
                <Link to="/signup">SIGN UP</Link>
              </li>
            </>
          ) : (
            <>
              <li className="role-badge">
                {role?.toUpperCase()}
              </li>

              <li>
                <button
                  onClick={handleLogout}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  LOGOUT
                </button>
              </li>
            </>
          )}

          <li>
            <div
              id="google_translate_element"
              style={{ display: "inline-block", verticalAlign: "middle" }}
            ></div>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;