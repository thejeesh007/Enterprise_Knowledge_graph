import React from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const container = {
    padding: "50px",
    fontFamily: "Arial, sans-serif"
  };

  const hero = {
    marginBottom: "50px"
  };

  const title = {
    fontSize: "42px",
    fontWeight: "800",
    marginBottom: "12px",
    background: "linear-gradient(90deg, #2563eb, #1e40af)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  };

  const subtitle = {
    fontSize: "18px",
    color: "#555",
    maxWidth: "700px",
    lineHeight: "1.6"
  };

  const statsRow = {
    display: "flex",
    gap: "30px",
    marginTop: "30px",
    flexWrap: "wrap"
  };

  const statBox = {
    padding: "16px 22px",
    borderRadius: "12px",
    background: "#f1f5ff",
    fontSize: "14px",
    fontWeight: "600"
  };

  const cardContainer = {
    display: "flex",
    gap: "30px",
    flexWrap: "wrap",
    marginTop: "60px"
  };

  const card = {
    width: "300px",
    padding: "30px",
    borderRadius: "16px",
    border: "1px solid #e0e0e0",
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(0,0,0,0.1)",
    transition: "transform 0.25s ease",
    backgroundColor: "#fff"
  };

  const cardIcon = {
    fontSize: "32px",
    marginBottom: "14px"
  };

  const cardTitle = {
    fontSize: "22px",
    fontWeight: "700",
    marginBottom: "10px"
  };

  const cardDesc = {
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.5"
  };

  return (
    <div style={container}>
      {/* ---------- Hero Section ---------- */}
      <div style={hero}>
        <div style={title}>Enterprise Knowledge Graph</div>
        <div style={subtitle}>
          A unified academic intelligence platform connecting students, faculty,
          research, projects, and skills through a powerful graph-based system.
        </div>

        {/* Quick stats (static for now) */}
        <div style={statsRow}>
          <div style={statBox}>🎓 25+ Students</div>
          <div style={statBox}>👨‍🏫 5 Faculty Members</div>
          <div style={statBox}>📚 4 Courses</div>
          <div style={statBox}>🧠 Knowledge Graph Powered</div>
        </div>
      </div>

      {/* ---------- Navigation Cards ---------- */}
      <div style={cardContainer}>
        <div
          style={card}
          onClick={() => navigate("/students")}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          <div style={cardIcon}>🎓</div>
          <div style={cardTitle}>Students</div>
          <div style={cardDesc}>
            Browse detailed student profiles including academics, skills,
            interests, projects, and mentorship information.
          </div>
        </div>

        <div
          style={card}
          onClick={() => navigate("/faculty")}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          <div style={cardIcon}>👨‍🏫</div>
          <div style={cardTitle}>Faculty</div>
          <div style={cardDesc}>
            Explore faculty profiles with research impact, publications,
            courses taught, and academic experience.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
