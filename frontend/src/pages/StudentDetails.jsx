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
  const [skillGap, setSkillGap]=useState([]);
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [readiness, setReadiness] = useState(null);
  const [researchMentors, setResearchMentors] = useState([]);
  const [resumeText, setResumeText] = useState("");
const [resumeResult, setResumeResult] = useState(null);
const [analyzingResume, setAnalyzingResume] = useState(false);

  useEffect(() => {
    // Get all students and find one (simple & safe)
    api
  .get(`/analysis/student/${id}/research-compatibility`)
  .then(res => setResearchMentors(res.data))
  .catch(() => setResearchMentors([]));

    api.get(`/analysis/student/${id}/readiness`)
  .then(res => setReadiness(res.data))
  .catch(() => setReadiness(null));

    api.get(`/analysis/student/${id}/skill-gap`)
  .then(res => setSkillGap(res.data))
  .catch(() => setSkillGap([]));

    api
  .get(`/recommendations/student/${id}/projects`)
  .then(res => setRecommendedProjects(res.data));
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
const analyzeResume = async () => {
  if (!resumeText.trim()) {
    alert("Please paste resume content first");
    return;
  }

  try {
    setAnalyzingResume(true);

    const res = await api.post(
      `/resume/analyze/${id}`,
      { resumeText }
    );

    setResumeResult(res.data);
  } catch (err) {
    console.error(err);
    alert("Resume analysis failed");
  } finally {
    setAnalyzingResume(false);
  }
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
    {readiness && (
  <div style={{ marginTop: "25px" }}>
    <h2>🚀 Career Readiness</h2>

    <div
      style={{
        width: "100%",
        height: "16px",
        background: "#eee",
        borderRadius: "10px",
        overflow: "hidden",
        marginTop: "8px"
      }}
    >
      <div
        style={{
          width: `${readiness.readiness}%`,
          height: "100%",
          background:
            readiness.readiness > 70
              ? "#4caf50"
              : readiness.readiness > 40
              ? "#ff9800"
              : "#f44336"
        }}
      />
    </div>

    <p style={{ marginTop: "6px", fontSize: "14px" }}>
      {readiness.readiness}% ready • {readiness.ownedCount} /{" "}
      {readiness.totalRequired} skills acquired
    </p>
  </div>
)}

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
<h2 style={{ marginTop: "50px" }}>🎓 Recommended Research Mentors</h2>

{researchMentors.length === 0 ? (
  <p style={{ color: "#666" }}>
    No research mentor recommendations available yet.
  </p>
) : (
  <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
    {researchMentors.map((m, i) => (
      <div
        key={i}
        style={{
          width: "300px",
          padding: "20px",
          borderRadius: "14px",
          background: "#ffffff",
          border: "1px solid #e0e0e0",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
        }}
      >
        <h3 style={{ marginBottom: "6px" }}>{m.faculty}</h3>

        <div style={{ fontSize: "14px", color: "#555" }}>
          {m.designation} • {m.department}
        </div>

        {/* Compatibility bar */}
        <div
          style={{
            marginTop: "12px",
            height: "10px",
            background: "#eee",
            borderRadius: "6px",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              width: `${m.compatibility}%`,
              height: "100%",
              background:
                m.compatibility > 70
                  ? "#4caf50"
                  : m.compatibility > 40
                  ? "#ff9800"
                  : "#f44336"
            }}
          />
        </div>

        <div
          style={{
            marginTop: "6px",
            fontSize: "13px",
            fontWeight: "bold"
          }}
        >
          Compatibility: {m.compatibility}%
        </div>

        {/* Explanation */}
        <div style={{ marginTop: "12px", fontSize: "13px", color: "#444" }}>
          <strong>Why this mentor?</strong>
          <ul style={{ paddingLeft: "18px", marginTop: "6px" }}>
            {m.matchedResearch.map((r, idx) => (
              <li key={idx}>Shared interest in {r}</li>
            ))}
          </ul>
        </div>
      </div>
    ))}
  </div>
)}

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
    <p style={{ fontSize: "13px", color: "#555", marginTop: "6px" }}>
  💡 {p.explanation}
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
    {/* ================= Resume Analyzer ================= */}
<div style={{ marginTop: "60px" }}>
  <h2>📄 Resume Analyzer</h2>

  <textarea
    rows="6"
    placeholder="Paste resume content here..."
    value={resumeText}
    onChange={e => setResumeText(e.target.value)}
    style={{
      width: "100%",
      padding: "14px",
      borderRadius: "10px",
      border: "1px solid #ccc",
      marginTop: "12px",
      fontSize: "14px"
    }}
  />

  <button
    onClick={analyzeResume}
    disabled={analyzingResume}
    style={{
      marginTop: "15px",
      padding: "12px 22px",
      borderRadius: "10px",
      background: "#2f5fff",
      color: "white",
      border: "none",
      fontSize: "14px",
      cursor: "pointer"
    }}
  >
    {analyzingResume ? "Analyzing..." : "Analyze Resume"}
  </button>

  {resumeResult && (
    <div
      style={{
        marginTop: "30px",
        padding: "22px",
        borderRadius: "14px",
        background: "#f9fbff",
        border: "1px solid #dce3ff"
      }}
    >
      <h3>🎯 Target Role: {resumeResult.role}</h3>
      <h3>📊 Resume Score: {resumeResult.score}%</h3>

      <h4 style={{ marginTop: "15px" }}>✅ Matched Skills</h4>
      <ul>
        {resumeResult.matchedSkills.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>

      <h4 style={{ marginTop: "15px" }}>❌ Missing Skills</h4>
      <ul>
        {resumeResult.missingSkills.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </div>
  )}
</div>
{/* ================= END Resume Analyzer ================= */}

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
      <h2 style={{ marginTop: "40px" }}>📈 Skill Gap Analysis</h2>

{skillGap.length > 0 ? (
  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
    {skillGap.map((s, i) => (
      <span
        key={i}
        style={{
          padding: "10px 14px",
          borderRadius: "20px",
          background: "#ffecec",
          color: "#b00020",
          fontWeight: "500"
        }}
      >
        {s}
      </span>
    ))}
  </div>
) : (
  <p style={{ color: "#555" }}>
    No immediate skill gaps detected 🎉
  </p>
)}

    </div>
    
  );
}

export default StudentDetails;
