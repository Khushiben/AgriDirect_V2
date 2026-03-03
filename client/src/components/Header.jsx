import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Header.css";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Listen for login event from other components
    const handleLogin = () => {
      const updatedUser = localStorage.getItem("user");
      if (updatedUser) {
        setUser(JSON.parse(updatedUser));
      }
    };

    // Listen for logout event
    const handleLogoutEvent = () => {
      setUser(null);
    };

    window.addEventListener("userLogin", handleLogin);
    window.addEventListener("userLogout", handleLogoutEvent);
    return () => {
      window.removeEventListener("userLogin", handleLogin);
      window.removeEventListener("userLogout", handleLogoutEvent);
    };
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("userLogout"));
      navigate("/");
    }
  };

  useEffect(() => {
    // ✅ Prevent multiple script injections
    if (window.googleTranslateElementInit) return;

    window.googleTranslateElementInit = function () {
      new window.google.translate.TranslateElement(
        { pageLanguage: "en" },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

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

          {/* dashboard link always visible; if not logged in route to login */}
          <li>
            <Link to={user ? `/${user.role}/dashboard` : "/login"}>
              DASHBOARD
            </Link>
          </li>

          <li>
            <Link to="/about">ABOUT US</Link>
          </li>

          {!user ? (
            <>
              <li>
                <Link to="/login">LOGIN</Link>
              </li>
              <li>
                <Link to="/signup">SIGN UP</Link>
              </li>
            </>
          ) : (
            <li>
              <a
                onClick={handleLogout}
                style={{
                  cursor: "pointer",
                  textDecoration: "none",
                }}
              >
                LOGOUT ({user.role.toUpperCase()})
              </a>
            </li>
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