import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import FacultyCard from "../components/FacultyCard";

function Faculty() {
  const [faculty, setFaculty] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/faculty").then((res) => setFaculty(res.data));
  }, []);

  const styles = {
    page: {
      minHeight: "100vh",
      padding: "34px 24px 56px",
      background: "var(--bg-main)",
      fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif"
    },
    shell: {
      maxWidth: "1120px",
      margin: "0 auto"
    },
    hero: {
      padding: "24px",
      borderRadius: "18px",
      border: "1px solid var(--border-color)",
      background: "var(--card-bg)",
      boxShadow: "var(--shadow-soft)",
      marginBottom: "24px"
    },
    title: {
      margin: 0,
      fontSize: "34px",
      color: "var(--text-primary)",
      fontWeight: 800,
      letterSpacing: "-0.02em"
    },
    subtitle: {
      margin: "8px 0 0",
      color: "var(--text-muted)",
      fontSize: "15px"
    },
    statRow: {
      marginTop: "14px",
      display: "flex",
      gap: "10px",
      flexWrap: "wrap"
    },
    pill: {
      display: "inline-flex",
      alignItems: "center",
      borderRadius: "999px",
      border: "1px solid var(--border-color)",
      background: "var(--accent-soft)",
      color: "var(--text-primary)",
      padding: "7px 12px",
      fontSize: "13px",
      fontWeight: 700
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
      gap: "20px"
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.hero}>
          <h1 style={styles.title}>Faculty</h1>
          <p style={styles.subtitle}>
            Explore faculty members, open profile details, and review courses,
            publications, and academic background.
          </p>
          <div style={styles.statRow}>
            <span style={styles.pill}>Total Faculty: {faculty.length}</span>
          </div>
        </div>

        <div style={styles.grid}>
          {faculty.map((f) => (
            <FacultyCard
              key={f.id}
              faculty={f}
              onClick={() => navigate(`/faculty/${f.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Faculty;
