import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function StudentDetails() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [mentor, setMentor] = useState(null);
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  
  const [recommendedMentors, setRecommendedMentors] = useState([]);

  useEffect(() => {
    // Get all students and find one (simple & safe)
    api.get("/students").then(res => {
      const found = res.data.find(s => s.id === Number(id));
      setStudent(found);
    });
    api.get(`/student/${id}/projects`)
  .then(res => setProjects(res.data))
  .catch(() => setProjects([]));
    api.get(`/student/${id}/mentor`)
  .then(res => {
    if (res.data.length > 0) setMentor(res.data[0]);
  })
  .catch(() => setMentor(null));
    api.get(`/recommendations/student/${id}/mentors`)
  .then(res => setRecommendedMentors(res.data))
  .catch(() => setRecommendedMentors([]));

    // Get skills
    api.get(`/student/${id}/skills`)
      .then(res => setSkills(res.data))
      .catch(() => setSkills([]));
  }, [id]);
    api
  .get(`/recommendations/student/${id}/projects`)
  .then(res => setRecommendedProjects(res.data));

  if (!student) return <div style={{ padding: "40px" }}>Loading...</div>;

  const container = {
    padding: "40px",
    maxWidth: "900px"
  };

  

  const section = {
    marginTop: "30px"
  };

  const sectionTitle = {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "10px"
  };

  const text = {
    fontSize: "16px",
    marginBottom: "6px"
  };

  const badge = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 14px",
  borderRadius: "20px",
  backgroundColor: "#eef2ff",
  marginRight: "10px",
  marginBottom: "10px",
  fontSize: "14px",
  fontWeight: "500"
};


  return (
    <div style={container}>
      {/* Profile Header */}
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
      <div style={{ fontSize: "34px", fontWeight: "bold" }}>
        {student.name}
      </div>
      <div style={{ fontSize: "16px", color: "#555", marginTop: "4px" }}>
        {student.program} • {student.dept} • Year {student.year}
      </div>
    </div>

    <div
      style={{
        padding: "12px 18px",
        borderRadius: "30px",
        backgroundColor: "#2f5fff",
        color: "white",
        fontSize: "18px",
        fontWeight: "bold"
      }}
    >
      GPA {student.gpa}
    </div>
  </div>

  <div style={{ marginTop: "15px", fontSize: "14px", color: "#333" }}>
    📧 {student.email} &nbsp;&nbsp;|&nbsp;&nbsp; 🌍 {student.country}
  </div>
</div>
{/* Mentor */}
<div style={section}>
  <div style={sectionTitle}>Faculty Mentor</div>

  {mentor ? (
    <div
      style={{
        padding: "15px",
        borderRadius: "10px",
        border: "1px solid #ddd",
        background: "#f5f7ff"
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: "18px" }}>
        {mentor.name}
      </div>
      <div style={{ fontSize: "14px", color: "#555" }}>
        {mentor.designation}, {mentor.department}
      </div>
    </div>
  ) : (
    <div style={text}>No mentor assigned</div>
  )}
</div>

{/* Projects */}
<div style={section}>
  <div style={sectionTitle}>Projects</div>

  {projects.length > 0 ? (
    projects.map((p, idx) => (
      <div
        key={idx}
        style={{
          padding: "12px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          marginBottom: "10px",
          background: "#fafafa"
        }}
      >
        <div style={{ fontWeight: "bold" }}>{p.title}</div>
        <div style={{ fontSize: "14px", color: "#666" }}>
          Domain: {p.domain}
        </div>
      </div>
    ))
  ) : (
    <div style={text}>No projects linked</div>
  )}
</div>
<h2 style={{ marginTop: "40px" }}>🔥 Recommended Projects</h2>

{recommendedProjects.length === 0 && (
  <p style={{ color: "#777" }}>
    No recommendations available yet.
  </p>
)}

{recommendedProjects.map((p, i) => (
  <div
    key={i}
    style={{
      padding: "15px",
      marginBottom: "15px",
      borderRadius: "10px",
      border: "1px solid #ddd",
      background: "#fafafa"
    }}
  >
    <h3 style={{ marginBottom: "5px" }}>{p.title}</h3>
    <p style={{ margin: "4px 0" }}>
      <strong>Domain:</strong> {p.domain}
    </p>

    <p style={{ margin: "4px 0" }}>
      <strong>Matched Skills:</strong>{" "}
      {p.matchedSkills.join(", ")}
    </p>

    <p style={{ margin: "4px 0", color: "#444" }}>
      <strong>Relevance:</strong>{" "}
      {"⭐".repeat(p.relevance)}
    </p>
  </div>
))}
        <h2 style={{ marginTop: "40px" }}>🎓 Recommended Mentors</h2>

{recommendedMentors.length === 0 && (
  <p style={{ color: "#777" }}>No mentor recommendations available.</p>
)}

<div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
  {recommendedMentors.map((m, i) => (
    <div
      key={i}
      style={{
        width: "280px",
        padding: "20px",
        borderRadius: "12px",
        border: "1px solid #e0e0e0",
        background: "#fff",
        boxShadow: "0 6px 15px rgba(0,0,0,0.08)"
      }}
    >
      <h3 style={{ marginBottom: "5px" }}>{m.mentor}</h3>
      <div style={{ fontSize: "14px", color: "#555" }}>
        {m.designation} • {m.department}
      </div>

      <div
        style={{
          marginTop: "10px",
          padding: "6px 10px",
          background: "#eef4ff",
          borderRadius: "20px",
          display: "inline-block",
          fontSize: "13px",
          fontWeight: "bold"
        }}
      >
        Relevance Score: {m.relevance}
      </div>

      {m.matchedSkills.length > 0 && (
        <>
          <h4 style={{ marginTop: "15px" }}>Matched Skills</h4>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {m.matchedSkills.map((s, idx) => (
              <span
                key={idx}
                style={{
                  padding: "6px 10px",
                  background: "#f1f1f1",
                  borderRadius: "20px",
                  fontSize: "12px"
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </>
      )}

      {m.matchedResearch.length > 0 && (
        <>
          <h4 style={{ marginTop: "12px" }}>Research Alignment</h4>
          <ul style={{ paddingLeft: "18px", fontSize: "13px" }}>
            {m.matchedResearch.map((r, idx) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  ))}
</div>

      {/* Academic Info */}
      <div style={section}>
        <div style={sectionTitle}>Academic Information</div>
        <div style={text}>University ID: {student.university_id}</div>
        <div style={text}>Year: {student.year}</div>
        <div style={text}>Enrollment Year: {student.enrollment_year}</div>
        <div style={text}>GPA: {student.gpa}</div>
      </div>

      {/* Career */}
      <div style={section}>
        <div style={sectionTitle}>Career Goal</div>
        <div style={text}>{student.career_goal}</div>
      </div>

      {/* Interests */}
      <div style={section}>
        <div style={sectionTitle}>Interests</div>
        {student.interests?.map((i, idx) => (
          <span key={idx} style={badge}>{i}</span>
        ))}
      </div>

      {/* Skills */}
      <div style={section}>
        <div style={sectionTitle}>Skills</div>
        {skills.length > 0
          ? skills.map((s, idx) => (
              <span key={idx} style={badge}>{s}</span>
            ))
          : <div style={text}>No skills linked</div>
        }
      </div>
    </div>
  );
}

export default StudentDetails;
