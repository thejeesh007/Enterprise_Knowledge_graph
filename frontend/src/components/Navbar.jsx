import React from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const nav = {
    padding: "14px 30px",
    background: "linear-gradient(90deg, #1f2933, #111827)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  };

  const brand = {
    color: "white",
    fontSize: "20px",
    fontWeight: "700",
    letterSpacing: "0.5px"
  };

  const links = {
    display: "flex",
    gap: "20px"
  };

  const linkStyle = (path) => ({
    color: location.pathname === path ? "#93c5fd" : "white",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: "500",
    paddingBottom: "4px",
    borderBottom:
      location.pathname === path ? "2px solid #93c5fd" : "2px solid transparent",
    transition: "all 0.2s ease"
  });

  return (
    <nav style={nav}>
      {/* Brand */}
      <div style={brand}>
        University Knowledge Graph
      </div>

      {/* Links */}
      <div style={links}>
        <Link to="/" style={linkStyle("/")}>
          Dashboard
        </Link>
        <Link to="/students" style={linkStyle("/students")}>
          Students
        </Link>
        <Link to="/faculty" style={linkStyle("/faculty")}>
          Faculty
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
