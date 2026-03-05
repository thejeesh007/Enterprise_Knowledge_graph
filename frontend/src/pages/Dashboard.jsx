import React from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const styles = {
    page: {
      minHeight: "100vh",
      padding: "38px 28px 56px",
      background: "var(--bg-main)",
      fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
      color: "var(--text-primary)"
    },
    shell: {
      maxWidth: "1100px",
      margin: "0 auto"
    },
    hero: {
      border: "1px solid var(--border-color)",
      borderRadius: "20px",
      padding: "28px",
      background: "var(--card-bg)",
      boxShadow: "var(--shadow-soft)"
    },
    title: {
      fontSize: "42px",
      fontWeight: 800,
      marginBottom: "10px",
      letterSpacing: "-0.02em",
      background: "linear-gradient(90deg, #1d4ed8, #0f172a)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent"
    },
    subtitle: {
      fontSize: "17px",
      lineHeight: 1.65,
      color: "var(--text-muted)",
      maxWidth: "760px"
    },
    statRow: {
      marginTop: "24px",
      display: "flex",
      flexWrap: "wrap",
      gap: "12px"
    },
    stat: {
      padding: "10px 14px",
      borderRadius: "999px",
      background: "var(--accent-soft)",
      border: "1px solid var(--border-color)",
      color: "var(--text-primary)",
      fontSize: "13px",
      fontWeight: 700
    },
    sectionTitle: {
      marginTop: "34px",
      marginBottom: "14px",
      fontSize: "22px",
      fontWeight: 750
    },
    cardGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: "16px"
    },
    card: {
      border: "1px solid var(--border-color)",
      borderRadius: "16px",
      padding: "24px",
      background: "var(--card-bg)",
      cursor: "pointer",
      boxShadow: "var(--shadow-soft)",
      transition: "transform 0.25s ease, box-shadow 0.25s ease"
    },
    cardIcon: {
      width: "46px",
      height: "46px",
      borderRadius: "12px",
      display: "grid",
      placeItems: "center",
      marginBottom: "14px",
      fontSize: "22px",
      background: "var(--accent-soft)",
      color: "var(--text-primary)"
    },
    cardTitle: {
      fontSize: "22px",
      fontWeight: 750,
      marginBottom: "10px"
    },
    cardDesc: {
      fontSize: "14px",
      lineHeight: 1.6,
      color: "var(--text-muted)"
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.hero}>
          <div style={styles.title}>Enterprise Knowledge Graph</div>
          <div style={styles.subtitle}>
            A unified academic intelligence platform connecting students, faculty,
            research, projects, and skills through a powerful graph-based system.
          </div>

          <div style={styles.statRow}>
            <div style={styles.stat}>25+ Students</div>
            <div style={styles.stat}>5 Faculty Members</div>
            <div style={styles.stat}>4 Courses</div>
            <div style={styles.stat}>Knowledge Graph Powered</div>
          </div>
        </div>

        <div style={styles.sectionTitle}>Explore Modules</div>

        <div style={styles.cardGrid}>
          <div
            style={styles.card}
            onClick={() => navigate("/students")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow = "0 20px 30px rgba(15, 23, 42, 0.14)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 12px 24px rgba(15, 23, 42, 0.08)";
            }}
          >
            <div style={styles.cardIcon}>S</div>
            <div style={styles.cardTitle}>Students</div>
            <div style={styles.cardDesc}>
              Browse detailed student profiles including academics, skills,
              interests, projects, and mentorship information.
            </div>
          </div>

          <div
            style={styles.card}
            onClick={() => navigate("/faculty")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow = "0 20px 30px rgba(15, 23, 42, 0.14)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 12px 24px rgba(15, 23, 42, 0.08)";
            }}
          >
            <div style={styles.cardIcon}>F</div>
            <div style={styles.cardTitle}>Faculty</div>
            <div style={styles.cardDesc}>
              Explore faculty profiles with research impact, publications,
              courses taught, and academic experience.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
