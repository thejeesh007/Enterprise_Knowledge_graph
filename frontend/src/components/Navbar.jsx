import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  const nav = {
    padding: "14px 22px",
    background: "var(--nav-bg)",
    borderBottom: "1px solid var(--border-color)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px"
  };

  const brand = {
    color: "var(--text-primary)",
    fontSize: "18px",
    fontWeight: "800",
    letterSpacing: "0.5px"
  };

  const links = {
    display: "flex",
    gap: "20px"
  };

  const linkStyle = (path) => ({
    color: location.pathname === path ? "var(--accent-primary)" : "var(--text-muted)",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: "600",
    paddingBottom: "4px",
    borderBottom:
      location.pathname === path ? "2px solid var(--accent-primary)" : "2px solid transparent",
    transition: "all 0.2s ease"
  });

  const right = {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  };

  const toggleBtn = {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid var(--border-color)",
    background: "var(--card-bg)",
    color: "var(--text-primary)",
    fontWeight: 700,
    fontSize: "12px",
    cursor: "pointer"
  };

  return (
    <nav style={nav}>
      <div style={brand}>
        University Knowledge Graph
      </div>

      <div style={right}>
        <div style={links}>
          {isAuthenticated ? (
            <>
              <Link to="/" style={linkStyle("/")}>
                Dashboard
              </Link>
              <Link to="/students" style={linkStyle("/students")}>
                Students
              </Link>
              <Link to="/faculty" style={linkStyle("/faculty")}>
                Faculty
              </Link>
            </>
          ) : (
            <Link to="/login" style={linkStyle("/login")}>
              Login
            </Link>
          )}
        </div>
        {isAuthenticated ? (
          <div style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: 700 }}>
            {user?.email} ({user?.role})
          </div>
        ) : null}
        <button style={toggleBtn} onClick={toggleTheme}>
          {isDark ? "Light Mode" : "Dark Mode"}
        </button>
        {isAuthenticated ? (
          <button
            style={toggleBtn}
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </button>
        ) : null}
      </div>
    </nav>
  );
}

export default Navbar;
