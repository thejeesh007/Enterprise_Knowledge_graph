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
  const [skillGap, setSkillGap] = useState([]);
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [readiness, setReadiness] = useState(null);
  const [researchMentors, setResearchMentors] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [simulation, setSimulation] = useState(null);
  const [resumeResult, setResumeResult] = useState(null);
  const [analyzingResume, setAnalyzingResume] = useState(false);

  useEffect(() => {
    api
      .get(`/analysis/student/${id}/research-compatibility`)
      .then((res) => setResearchMentors(res.data))
      .catch(() => setResearchMentors([]));

    api
      .get("/career-roles")
      .then((res) => setRoles(res.data))
      .catch(() => setRoles([]));

    api
      .get(`/analysis/student/${id}/readiness`)
      .then((res) => setReadiness(res.data))
      .catch(() => setReadiness(null));

    api
      .get(`/analysis/student/${id}/skill-gap`)
      .then((res) => setSkillGap(res.data))
      .catch(() => setSkillGap([]));

    api
      .get(`/recommendations/student/${id}/projects`)
      .then((res) => setRecommendedProjects(res.data));

    api.get("/students").then((res) => {
      const found = res.data.find((s) => s.id === Number(id));
      setStudent(found);
    });

    api
      .get(`/student/${id}/projects`)
      .then((res) => setProjects(res.data))
      .catch(() => setProjects([]));

    api
      .get(`/student/${id}/mentor`)
      .then((res) => {
        if (res.data.length > 0) setMentor(res.data[0]);
      })
      .catch(() => setMentor(null));

    api
      .get(`/recommendations/student/${id}/mentors`)
      .then((res) => setRecommendedMentors(res.data))
      .catch(() => setRecommendedMentors([]));

    api
      .get(`/student/${id}/skills`)
      .then((res) => setSkills(res.data))
      .catch(() => setSkills([]));
  }, [id]);

  const analyzeResume = async () => {
    if (!resumeText.trim() && !resumeFile) {
      alert("Please upload a resume or paste resume content first");
      return;
    }

    try {
      setAnalyzingResume(true);
      const formData = new FormData();
      if (resumeText.trim()) formData.append("resumeText", resumeText.trim());
      if (resumeFile) formData.append("resumeFile", resumeFile);

      const res = await api.post(`/resume/analyze/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResumeResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Resume analysis failed");
    } finally {
      setAnalyzingResume(false);
    }
  };

  const runSimulation = () => {
    if (!selectedRole) return;
    api
      .get(`/simulation/student/${id}/role/${encodeURIComponent(selectedRole)}`)
      .then((res) => setSimulation(res.data))
      .catch(() => setSimulation(null));
  };

  if (!student) {
    return <div style={{ padding: "40px", color: "#334155" }}>Loading...</div>;
  }

  const scoreColor = (value) => {
    if (value > 70) return "#0f766e";
    if (value > 40) return "#b45309";
    return "#b91c1c";
  };

  const styles = {
    page: {
      maxWidth: "1100px",
      margin: "0 auto",
      padding: "28px 24px 56px",
      color: "#0f172a",
      fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
      background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)"
    },
    hero: {
      background: "linear-gradient(125deg, #eff6ff 0%, #eef2ff 55%, #f8fafc 100%)",
      border: "1px solid #dbeafe",
      borderRadius: "18px",
      padding: "26px",
      boxShadow: "0 16px 30px rgba(15, 23, 42, 0.08)",
      marginBottom: "24px"
    },
    heroTop: {
      display: "flex",
      justifyContent: "space-between",
      gap: "24px",
      alignItems: "flex-start",
      flexWrap: "wrap"
    },
    name: { fontSize: "34px", fontWeight: 800, lineHeight: 1.2 },
    subtitle: { marginTop: "8px", color: "#475569", fontSize: "15px" },
    gpa: {
      background: "#1d4ed8",
      color: "#fff",
      borderRadius: "999px",
      padding: "10px 18px",
      fontSize: "18px",
      fontWeight: 700,
      minWidth: "120px",
      textAlign: "center"
    },
    contact: {
      marginTop: "14px",
      color: "#334155",
      fontSize: "14px",
      display: "flex",
      gap: "12px",
      flexWrap: "wrap"
    },
    readinessWrap: {
      marginTop: "16px",
      maxWidth: "460px",
      background: "#ffffffc2",
      border: "1px solid #cbd5e1",
      borderRadius: "12px",
      padding: "12px 14px"
    },
    readinessTitle: { margin: 0, fontSize: "16px" },
    barTrack: {
      marginTop: "8px",
      height: "12px",
      background: "#e2e8f0",
      borderRadius: "999px",
      overflow: "hidden"
    },
    section: { marginTop: "24px" },
    sectionTitle: {
      marginBottom: "12px",
      fontSize: "22px",
      fontWeight: 750,
      color: "#0f172a"
    },
    card: {
      border: "1px solid #e2e8f0",
      borderRadius: "14px",
      background: "#fff",
      padding: "16px",
      boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)"
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "14px"
    },
    muted: { color: "#64748b", fontSize: "14px" },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      marginRight: "8px",
      marginBottom: "8px",
      padding: "7px 12px",
      borderRadius: "999px",
      border: "1px solid #dbeafe",
      background: "#eff6ff",
      color: "#1e3a8a",
      fontSize: "13px",
      fontWeight: 600
    },
    badBadge: {
      display: "inline-flex",
      marginRight: "8px",
      marginBottom: "8px",
      padding: "7px 12px",
      borderRadius: "999px",
      border: "1px solid #fecaca",
      background: "#fef2f2",
      color: "#991b1b",
      fontSize: "13px",
      fontWeight: 600
    },
    input: {
      width: "100%",
      padding: "12px",
      borderRadius: "10px",
      border: "1px solid #cbd5e1",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box"
    },
    button: {
      marginTop: "12px",
      padding: "10px 16px",
      borderRadius: "10px",
      border: "none",
      background: "#2563eb",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 600
    },
    select: {
      padding: "10px 12px",
      borderRadius: "10px",
      border: "1px solid #cbd5e1",
      marginRight: "8px",
      minWidth: "220px"
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.heroTop}>
          <div>
            <div style={styles.name}>{student.name}</div>
            <div style={styles.subtitle}>
              {student.program} | {student.dept} | Year {student.year}
            </div>
          </div>
          <div style={styles.gpa}>GPA {student.gpa}</div>
        </div>

        {readiness && (
          <div style={styles.readinessWrap}>
            <h3 style={styles.readinessTitle}>Career Readiness</h3>
            <div style={styles.barTrack}>
              <div
                style={{
                  width: `${readiness.readiness}%`,
                  height: "100%",
                  background: scoreColor(readiness.readiness)
                }}
              />
            </div>
            <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#334155" }}>
              {readiness.readiness}% ready | {readiness.ownedCount} / {readiness.totalRequired} skills acquired
            </p>
          </div>
        )}

        <div style={styles.contact}>
          <span>{student.email}</span>
          <span>{student.country}</span>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Faculty Mentor</div>
        {mentor ? (
          <div style={styles.card}>
            <div style={{ fontSize: "18px", fontWeight: 700 }}>{mentor.name}</div>
            <div style={styles.muted}>
              {mentor.designation}, {mentor.department}
            </div>
          </div>
        ) : (
          <div style={styles.muted}>No mentor assigned</div>
        )}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Projects</div>
        {projects.length > 0 ? (
          <div style={styles.grid}>
            {projects.map((p, idx) => (
              <div key={idx} style={styles.card}>
                <div style={{ fontWeight: 700 }}>{p.title}</div>
                <div style={styles.muted}>Domain: {p.domain}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.muted}>No projects linked</div>
        )}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Recommended Research Mentors</div>
        {researchMentors.length === 0 ? (
          <p style={styles.muted}>No research mentor recommendations available yet.</p>
        ) : (
          <div style={styles.grid}>
            {researchMentors.map((m, i) => (
              <div key={i} style={styles.card}>
                <h3 style={{ margin: 0 }}>{m.faculty}</h3>
                <div style={styles.muted}>
                  {m.designation} | {m.department}
                </div>

                <div style={styles.barTrack}>
                  <div
                    style={{
                      width: `${m.compatibility}%`,
                      height: "100%",
                      background: scoreColor(m.compatibility)
                    }}
                  />
                </div>
                <div style={{ marginTop: "6px", fontWeight: 600, fontSize: "13px" }}>
                  Compatibility: {m.compatibility}%
                </div>

                <ul style={{ margin: "10px 0 0", paddingLeft: "18px", color: "#334155", fontSize: "13px" }}>
                  {m.matchedResearch.map((r, idx) => (
                    <li key={idx}>Shared interest in {r}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Recommended Projects</div>
        {recommendedProjects.length === 0 && <p style={styles.muted}>No recommendations available yet.</p>}
        <div style={styles.grid}>
          {recommendedProjects.map((p, i) => (
            <div key={i} style={styles.card}>
              <h3 style={{ margin: 0 }}>{p.title}</h3>
              <p style={{ margin: "8px 0 0" }}>
                <strong>Domain:</strong> {p.domain}
              </p>
              <p style={{ margin: "6px 0 0" }}>
                <strong>Matched Skills:</strong> {p.matchedSkills.join(", ")}
              </p>
              <p style={{ margin: "6px 0 0" }}>
                <strong>Relevance:</strong> {p.relevance}
              </p>
              <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#475569" }}>{p.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Recommended Mentors</div>
        {recommendedMentors.length === 0 && <p style={styles.muted}>No mentor recommendations available.</p>}
        <div style={styles.grid}>
          {recommendedMentors.map((m, i) => (
            <div key={i} style={styles.card}>
              <h3 style={{ margin: 0 }}>{m.mentor}</h3>
              <div style={styles.muted}>
                {m.designation} | {m.department}
              </div>

              <div
                style={{
                  marginTop: "10px",
                  display: "inline-block",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  color: "#1e3a8a",
                  fontSize: "13px",
                  fontWeight: 700
                }}
              >
                Relevance Score: {m.relevance}
              </div>

              {m.matchedSkills.length > 0 && (
                <>
                  <h4 style={{ marginBottom: "8px" }}>Matched Skills</h4>
                  <div>
                    {m.matchedSkills.map((s, idx) => (
                      <span key={idx} style={styles.badge}>
                        {s}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {m.matchedResearch.length > 0 && (
                <>
                  <h4 style={{ marginBottom: "8px" }}>Research Alignment</h4>
                  <ul style={{ margin: 0, paddingLeft: "18px", color: "#334155", fontSize: "13px" }}>
                    {m.matchedResearch.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Academic Information</div>
        <div style={styles.card}>
          <div style={styles.muted}>University ID: {student.university_id}</div>
          <div style={styles.muted}>Year: {student.year}</div>
          <div style={styles.muted}>Enrollment Year: {student.enrollment_year}</div>
          <div style={styles.muted}>GPA: {student.gpa}</div>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Career Goal</div>
        <div style={styles.card}>{student.career_goal}</div>
      </div>

      <div style={styles.section}>
      <div style={styles.sectionTitle}>Resume Analyzer</div>
        <div style={styles.card}>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            style={{ ...styles.input, marginBottom: "10px" }}
          />
          {resumeFile && (
            <p style={{ marginTop: 0, marginBottom: "10px", color: "#475569", fontSize: "13px" }}>
              Selected file: {resumeFile.name}
            </p>
          )}

          <textarea
            rows="6"
            placeholder="Optional: paste resume content here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            style={styles.input}
          />

          <button onClick={analyzeResume} disabled={analyzingResume} style={styles.button}>
            {analyzingResume ? "Analyzing..." : "Analyze Resume"}
          </button>

          {resumeResult && (
            <div
              style={{
                marginTop: "18px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "14px"
              }}
            >
              <h3 style={{ marginTop: 0 }}>Target Role: {resumeResult.role}</h3>
              <h3>Resume Score: {resumeResult.score}%</h3>
              {resumeResult.scoreBreakdown && (
                <p style={{ marginTop: "6px", fontSize: "13px", color: "#475569" }}>
                  Skills: {resumeResult.scoreBreakdown.skillScore}% | Projects:{" "}
                  {resumeResult.scoreBreakdown.projectScore}% (
                  {resumeResult.scoreBreakdown.matchedProjects}/
                  {resumeResult.scoreBreakdown.totalProjects} aligned)
                </p>
              )}

              <h4 style={{ marginBottom: "8px" }}>Matched Skills</h4>
              <ul style={{ marginTop: 0, paddingLeft: "18px" }}>
                {resumeResult.matchedSkills.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>

              <h4 style={{ marginBottom: "8px" }}>Missing Skills</h4>
              <ul style={{ marginTop: 0, paddingLeft: "18px" }}>
                {resumeResult.missingSkills.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Interests</div>
        <div style={styles.card}>
          {student.interests?.map((item, idx) => (
            <span key={idx} style={styles.badge}>
              {item}
            </span>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Skills</div>
        <div style={styles.card}>
          {skills.length > 0 ? (
            skills.map((s, idx) => (
              <span key={idx} style={styles.badge}>
                {s}
              </span>
            ))
          ) : (
            <div style={styles.muted}>No skills linked</div>
          )}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Skill Gap Analysis</div>
        <div style={styles.card}>
          {skillGap.length > 0 ? (
            skillGap.map((s, i) => (
              <span key={i} style={styles.badBadge}>
                {s}
              </span>
            ))
          ) : (
            <p style={styles.muted}>No immediate skill gaps detected.</p>
          )}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Career Simulation</div>
        <div style={styles.card}>
          <div style={{ marginBottom: "14px" }}>
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} style={styles.select}>
              <option value="">Select Career Role</option>
              {roles.map((role, i) => (
                <option key={i} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <button onClick={runSimulation} style={{ ...styles.button, marginTop: 0 }}>
              Simulate
            </button>
          </div>

          {simulation && (
            <div style={{ marginTop: "6px" }}>
              <h3 style={{ marginBottom: "8px" }}>Simulation Result</h3>
              <p style={{ margin: "6px 0" }}>
                Current Readiness: <strong>{simulation.currentReadiness}%</strong>
              </p>
              <p style={{ margin: "6px 0" }}>
                Improvement Potential: <strong>+{simulation.improvement}%</strong>
              </p>
              <h4 style={{ marginBottom: "8px" }}>Missing Skills</h4>
              {simulation.missingSkills.length > 0 ? (
                simulation.missingSkills.map((s, i) => (
                  <span key={i} style={styles.badBadge}>
                    {s}
                  </span>
                ))
              ) : (
                <p style={styles.muted}>No missing skills.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDetails;
