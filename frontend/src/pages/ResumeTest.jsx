import React, { useState } from "react";
import api from "../services/api";

function ResumeTest() {
  const [result, setResult] = useState(null);

  const testResume = () => {
    api.post("/resume/analyze", {
      studentId: 1,
      resumeText: `
        I have experience in Python, React, SQL and web development.
        Built multiple projects using Node.js and databases.
      `
    })
    .then(res => setResult(res.data))
    .catch(err => alert(err.response?.data?.error || "Error"));
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px" }}>
      <h1>Resume Analyzer Test</h1>

      <button
        onClick={testResume}
        style={{
          padding: "12px 20px",
          background: "#2f5fff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        Analyze Resume
      </button>

      {result && (
        <div style={{ marginTop: "30px" }}>
          <h2>Results</h2>
          <p><b>Target Role:</b> {result.targetRole}</p>
          <p><b>Resume Score:</b> {result.resumeScore}%</p>

          <h3>Matched Skills</h3>
          <ul>
            {result.matchedSkills.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>

          <h3>Missing Skills</h3>
          <ul>
            {result.missingSkills.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ResumeTest;
