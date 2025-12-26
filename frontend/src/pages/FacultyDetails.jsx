import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function FacultyDetails() {
  const { id } = useParams();
  const [faculty, setFaculty] = useState(null);
  const [courses, setCourses] = useState([]);
  const [publications, setPublications] = useState([]);

  useEffect(() => {
    api.get("/faculty").then(res => {
      setFaculty(res.data.find(f => f.id === Number(id)));
    });

    api.get(`/faculty/${id}/courses`).then(res => setCourses(res.data));
    api.get(`/faculty/${id}/publications`).then(res => setPublications(res.data));
  }, [id]);

  if (!faculty) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={{ padding: "40px", maxWidth: "900px" }}>
      
      {/* ---------- Profile Header ---------- */}
      <div
        style={{
          padding: "25px",
          borderRadius: "12px",
          background: "#f9fbff",
          border: "1px solid #dce3ff",
          marginBottom: "40px"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div>
            <div style={{ fontSize: "32px", fontWeight: "700" }}>
              {faculty.name}
            </div>
            <div style={{ color: "#555", marginTop: "4px" }}>
              {faculty.designation} • {faculty.department}
            </div>
          </div>

          <div
            style={{
              padding: "12px 18px",
              borderRadius: "30px",
              backgroundColor: "#2f5fff",
              color: "white",
              fontWeight: "700",
              fontSize: "16px"
            }}
          >
            H-index {faculty.h_index}
          </div>
        </div>

        <div style={{ marginTop: "12px", fontSize: "14px", color: "#333" }}>
          📧 {faculty.email} &nbsp;&nbsp;|&nbsp;&nbsp; 🌍 {faculty.country}
        </div>

        <div style={{ fontSize: "14px", marginTop: "6px", color: "#333" }}>
          🎓 {faculty.highest_degree} • {faculty.years_of_experience} years experience
        </div>

        <div style={{ fontSize: "14px", marginTop: "6px", color: "#333" }}>
          🏢 Office: {faculty.office}
        </div>
      </div>

      {/* ---------- Courses ---------- */}
      <div style={{ marginBottom: "30px" }}>
        <div style={{ fontSize: "22px", fontWeight: "700", marginBottom: "10px" }}>
          Courses Taught
        </div>

        {courses.length > 0 ? (
          courses.map((c, i) => (
            <div
              key={i}
              style={{
                padding: "10px 14px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                marginBottom: "8px",
                background: "#fafafa"
              }}
            >
              <strong>{c.code}</strong> — {c.name}
            </div>
          ))
        ) : (
          <div style={{ color: "#666" }}>No courses assigned</div>
        )}
      </div>

      {/* ---------- Publications ---------- */}
      <div>
        <div style={{ fontSize: "22px", fontWeight: "700", marginBottom: "10px" }}>
          Publications
        </div>

        {publications.length > 0 ? (
          publications.map((p, i) => (
            <div
              key={i}
              style={{
                padding: "12px 14px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                marginBottom: "10px",
                background: "#ffffff"
              }}
            >
              <div style={{ fontWeight: "600" }}>{p.title}</div>
              <div style={{ fontSize: "14px", color: "#555" }}>
                {p.journal} ({p.year})
              </div>
            </div>
          ))
        ) : (
          <div style={{ color: "#666" }}>No publications available</div>
        )}
      </div>

    </div>
  );
}

export default FacultyDetails;
