import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function FacultyDetails() {
  const { id } = useParams();
  const [faculty, setFaculty] = useState(null);
  const [courses, setCourses] = useState([]);
  const [publications, setPublications] = useState([]);

  useEffect(() => {
    api.get("/faculty").then((res) => {
      setFaculty(res.data.find((f) => f.id === Number(id)));
    });

    api.get(`/faculty/${id}/courses`).then((res) => setCourses(res.data));
    api.get(`/faculty/${id}/publications`).then((res) => setPublications(res.data));
  }, [id]);

  if (!faculty) return <div style={{ padding: "40px", color: "#334155" }}>Loading...</div>;

  const styles = {
    page: {
      maxWidth: "1100px",
      margin: "0 auto",
      padding: "28px 24px 56px",
      background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
      fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
      color: "#0f172a"
    },
    hero: {
      borderRadius: "18px",
      border: "1px solid #bae6fd",
      padding: "26px",
      background: "linear-gradient(130deg, #ffffff 0%, #f0f9ff 60%, #ecfeff 100%)",
      boxShadow: "0 16px 30px rgba(15, 23, 42, 0.08)",
      marginBottom: "24px"
    },
    heroTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "20px",
      flexWrap: "wrap"
    },
    name: {
      fontSize: "34px",
      fontWeight: 800,
      lineHeight: 1.2
    },
    subtitle: {
      marginTop: "6px",
      fontSize: "15px",
      color: "#475569"
    },
    chip: {
      borderRadius: "999px",
      padding: "10px 16px",
      background: "#0ea5e9",
      color: "#fff",
      fontWeight: 700,
      fontSize: "15px"
    },
    infoRow: {
      marginTop: "14px",
      display: "flex",
      flexWrap: "wrap",
      gap: "10px"
    },
    infoPill: {
      border: "1px solid #bae6fd",
      background: "#f0f9ff",
      color: "#0c4a6e",
      borderRadius: "999px",
      padding: "7px 12px",
      fontSize: "13px",
      fontWeight: 600
    },
    section: {
      marginTop: "24px"
    },
    sectionTitle: {
      marginBottom: "12px",
      fontSize: "22px",
      fontWeight: 750
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "14px"
    },
    card: {
      border: "1px solid #e2e8f0",
      borderRadius: "14px",
      background: "#fff",
      boxShadow: "0 10px 22px rgba(15, 23, 42, 0.06)",
      padding: "14px"
    },
    muted: {
      color: "#64748b",
      fontSize: "14px"
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.heroTop}>
          <div>
            <div style={styles.name}>{faculty.name}</div>
            <div style={styles.subtitle}>
              {faculty.designation} | {faculty.department}
            </div>
          </div>
          <div style={styles.chip}>H-index {faculty.h_index}</div>
        </div>

        <div style={styles.infoRow}>
          <span style={styles.infoPill}>{faculty.email}</span>
          <span style={styles.infoPill}>{faculty.country}</span>
          <span style={styles.infoPill}>
            {faculty.highest_degree} | {faculty.years_of_experience} years experience
          </span>
          <span style={styles.infoPill}>Office: {faculty.office}</span>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Courses Taught</div>
        {courses.length > 0 ? (
          <div style={styles.grid}>
            {courses.map((c, i) => (
              <div key={i} style={styles.card}>
                <div style={{ fontWeight: 700 }}>{c.code}</div>
                <div style={styles.muted}>{c.name}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.muted}>No courses assigned</div>
        )}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Publications</div>
        {publications.length > 0 ? (
          <div style={styles.grid}>
            {publications.map((p, i) => (
              <div key={i} style={styles.card}>
                <div style={{ fontWeight: 700 }}>{p.title}</div>
                <div style={styles.muted}>
                  {p.journal} ({p.year})
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.muted}>No publications available</div>
        )}
      </div>
    </div>
  );
}

export default FacultyDetails;
