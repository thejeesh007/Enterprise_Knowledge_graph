import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentCard from "../components/StudentCard";
import api from "../services/api";

function Students() {
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/students")
      .then((res) => setStudents(res.data))
      .catch((err) => console.error(err));
  }, []);

  const styles = {
    page: {
      minHeight: "100vh",
      padding: "34px 24px 56px",
      background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
      fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif"
    },
    shell: {
      maxWidth: "1120px",
      margin: "0 auto"
    },
    hero: {
      padding: "24px",
      borderRadius: "18px",
      border: "1px solid #dbeafe",
      background: "linear-gradient(140deg, #ffffff 0%, #eff6ff 65%, #ecfeff 100%)",
      boxShadow: "0 16px 30px rgba(15, 23, 42, 0.08)",
      marginBottom: "24px"
    },
    title: {
      margin: 0,
      fontSize: "34px",
      color: "#0f172a",
      fontWeight: 800,
      letterSpacing: "-0.02em"
    },
    subtitle: {
      margin: "8px 0 0",
      color: "#475569",
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
      border: "1px solid #bfdbfe",
      background: "#eff6ff",
      color: "#1e3a8a",
      padding: "7px 12px",
      fontSize: "13px",
      fontWeight: 700
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
      gap: "20px"
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.hero}>
          <h1 style={styles.title}>Students</h1>
          <p style={styles.subtitle}>
            Browse student profiles and open detailed views for analytics,
            recommendations, skill gaps, and career insights.
          </p>
          <div style={styles.statRow}>
            <span style={styles.pill}>Total Students: {students.length}</span>
          </div>
        </div>

        <div style={styles.grid}>
          {students.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onClick={() => navigate(`/students/${student.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Students;
