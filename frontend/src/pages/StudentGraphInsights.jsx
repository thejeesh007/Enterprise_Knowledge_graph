import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ForceGraph2D from "react-force-graph-2d";
import api from "../services/api";

function StudentGraphInsights() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [researchMentors, setResearchMentors] = useState([]);
  const [skillGap, setSkillGap] = useState([]);
  const [bridgeData, setBridgeData] = useState(null);

  const [reasonGraphData, setReasonGraphData] = useState(null);
  const [reasonGraphLoading, setReasonGraphLoading] = useState(false);
  const [reasonGraphMeta, setReasonGraphMeta] = useState(null);

  const [counterfactualSkills, setCounterfactualSkills] = useState([]);
  const [counterfactualData, setCounterfactualData] = useState(null);
  const [runningCounterfactual, setRunningCounterfactual] = useState(false);

  useEffect(() => {
    api.get("/students").then((res) => {
      const found = res.data.find((s) => s.id === Number(id));
      setStudent(found || null);
    });

    api
      .get(`/recommendations/student/${id}/projects`)
      .then((res) => setRecommendedProjects(res.data))
      .catch(() => setRecommendedProjects([]));

    api
      .get(`/recommendations/student/${id}/mentors`)
      .then((res) => setRecommendedMentors(res.data))
      .catch(() => setRecommendedMentors([]));

    api
      .get(`/analysis/student/${id}/research-compatibility`)
      .then((res) => setResearchMentors(res.data))
      .catch(() => setResearchMentors([]));

    api
      .get(`/analysis/student/${id}/skill-gap`)
      .then((res) => setSkillGap(res.data))
      .catch(() => setSkillGap([]));

    api
      .get(`/analysis/student/${id}/bridge-to-role`)
      .then((res) => setBridgeData(res.data))
      .catch(() => setBridgeData(null));
  }, [id]);

  const openReasonGraph = async (type, target, label, evidencePaths = []) => {
    try {
      setReasonGraphLoading(true);
      setReasonGraphMeta({ type, label, evidencePaths });
      const res = await api.get(`/recommendations/student/${id}/evidence-graph`, {
        params: { type, target }
      });
      setReasonGraphData(res.data);
    } catch (err) {
      alert(err?.response?.data?.error || "Could not load reason graph");
      setReasonGraphData(null);
    } finally {
      setReasonGraphLoading(false);
    }
  };

  const toggleCounterfactualSkill = (skill) => {
    setCounterfactualSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const runCounterfactual = async () => {
    if (!counterfactualSkills.length) return;
    try {
      setRunningCounterfactual(true);
      const res = await api.get(`/analysis/student/${id}/counterfactual`, {
        params: { addSkills: counterfactualSkills.join(",") }
      });
      setCounterfactualData(res.data);
    } catch (err) {
      alert(err?.response?.data?.error || "Counterfactual simulation failed");
      setCounterfactualData(null);
    } finally {
      setRunningCounterfactual(false);
    }
  };

  const styles = {
    page: {
      maxWidth: "1150px",
      margin: "0 auto",
      padding: "28px 24px 56px",
      fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
      color: "#0f172a",
      background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)"
    },
    card: {
      border: "1px solid #e2e8f0",
      borderRadius: "14px",
      background: "#fff",
      padding: "16px",
      boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
      marginTop: "16px"
    },
    title: { fontSize: "28px", fontWeight: 800, margin: 0 },
    muted: { color: "#64748b", fontSize: "14px" },
    sectionTitle: { fontSize: "22px", fontWeight: 750, marginBottom: "10px" },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: "12px"
    },
    button: {
      padding: "8px 12px",
      borderRadius: "8px",
      border: "1px solid #bfdbfe",
      background: "#eff6ff",
      color: "#1e3a8a",
      fontSize: "12px",
      fontWeight: 700,
      cursor: "pointer"
    },
    graphWrap: {
      width: "100%",
      height: "380px",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      overflow: "hidden",
      marginTop: "10px"
    }
  };

  if (!student) return <div style={{ padding: "40px" }}>Loading...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div>
            <h1 style={styles.title}>Graph Insights Lab</h1>
            <p style={styles.muted}>Student: {student.name} | ID: {student.id}</p>
          </div>
          <button style={styles.button} onClick={() => navigate(`/students/${id}`)}>Back to Student Details</button>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.sectionTitle}>Recommendation Reason Graphs</div>
        <div style={styles.grid}>
          {recommendedProjects.map((p, i) => (
            <div key={`p-${i}`} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px" }}>
              <div style={{ fontWeight: 700 }}>{p.title}</div>
              <div style={styles.muted}>Project | {p.domain}</div>
              <button style={{ ...styles.button, marginTop: "8px" }} onClick={() => openReasonGraph("project", p.title, p.title, p.evidencePaths || [])}>
                View Reason Graph
              </button>
            </div>
          ))}
          {recommendedMentors.map((m, i) => (
            <div key={`m-${i}`} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px" }}>
              <div style={{ fontWeight: 700 }}>{m.mentor}</div>
              <div style={styles.muted}>Mentor | {m.department}</div>
              <button style={{ ...styles.button, marginTop: "8px" }} onClick={() => openReasonGraph("mentor", m.mentor, m.mentor, m.evidencePaths || [])}>
                View Reason Graph
              </button>
            </div>
          ))}
          {researchMentors.map((m, i) => (
            <div key={`r-${i}`} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px" }}>
              <div style={{ fontWeight: 700 }}>{m.faculty}</div>
              <div style={styles.muted}>Research Mentor | {m.department}</div>
              <button
                style={{ ...styles.button, marginTop: "8px" }}
                onClick={() =>
                  openReasonGraph(
                    "mentor",
                    m.faculty,
                    m.faculty,
                    (m.matchedResearch || []).map((area) => ({
                      summary: `${m.faculty} researches ${area}`,
                      path: ["Student", `INTERESTED_IN -> ${area}`, `RESEARCHES_IN <- Faculty:${m.faculty}`]
                    }))
                  )
                }
              >
                View Reason Graph
              </button>
            </div>
          ))}
        </div>
      </div>

      {(reasonGraphLoading || reasonGraphData) && (
        <div style={styles.card}>
          <div style={{ fontWeight: 700 }}>Reason Graph {reasonGraphMeta?.label ? `- ${reasonGraphMeta.label}` : ""}</div>
          {reasonGraphLoading ? (
            <p style={styles.muted}>Loading graph...</p>
          ) : reasonGraphData?.nodes?.length ? (
            <div style={styles.graphWrap}>
              <ForceGraph2D
                graphData={{ nodes: reasonGraphData.nodes, links: reasonGraphData.links }}
                nodeLabel={(node) => `${node.label}: ${node.name || ""}`}
                linkLabel={(link) => link.type}
                nodeAutoColorBy="label"
                linkDirectionalArrowLength={6}
                linkDirectionalArrowRelPos={1}
                nodeCanvasObjectMode={() => "replace"}
                nodeCanvasObject={(node, ctx, globalScale) => {
                  const label = node.name || node.label || "";
                  const fontSize = Math.max(11 / globalScale, 3.5);
                  const radius = Math.max(8 / globalScale, 3);
                  const labelPadding = 2.5 / globalScale;
                  const colorMap = {
                    Student: "#1d4ed8",
                    Faculty: "#7c3aed",
                    Project: "#0f766e",
                    Skill: "#ea580c",
                    ResearchArea: "#0891b2"
                  };
                  const nodeColor = colorMap[node.label] || "#334155";

                  ctx.beginPath();
                  ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                  ctx.fillStyle = nodeColor;
                  ctx.fill();
                  ctx.lineWidth = Math.max(1 / globalScale, 0.4);
                  ctx.strokeStyle = "#ffffff";
                  ctx.stroke();

                  ctx.font = `${fontSize}px Sans-Serif`;
                  const textWidth = ctx.measureText(label).width;
                  const bckgHeight = fontSize + labelPadding * 2;
                  const bckgWidth = textWidth + labelPadding * 4;
                  const labelY = node.y + radius + bckgHeight / 2 + 2 / globalScale;

                  ctx.fillStyle = "rgba(255,255,255,0.85)";
                  ctx.fillRect(node.x - bckgWidth / 2, labelY - bckgHeight / 2, bckgWidth, bckgHeight);

                  ctx.textAlign = "center";
                  ctx.textBaseline = "middle";
                  ctx.fillStyle = "#111827";
                  ctx.fillText(label, node.x, labelY);
                }}
              />
            </div>
          ) : (
            <p style={styles.muted}>No graph data available.</p>
          )}
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.sectionTitle}>Graph Bridge To Career Role</div>
        {!bridgeData ? (
          <p style={styles.muted}>Bridge analysis not available.</p>
        ) : (
          <>
            <p style={styles.muted}>
              Target Role: {bridgeData.targetRole} | Current Readiness: {bridgeData.currentReadiness}% | Missing Skills: {bridgeData.shortestBridgeLength}
            </p>
            <div style={styles.grid}>
              {(bridgeData.bridgeItems || []).map((item, i) => (
                <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px" }}>
                  <div style={{ fontWeight: 700 }}>{item.skill}</div>
                  <div style={styles.muted}>Projects: {(item.viaProjects || []).join(", ") || "None"}</div>
                  <div style={styles.muted}>Courses: {(item.viaCourses || []).join(", ") || "None"}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={styles.card}>
        <div style={styles.sectionTitle}>Counterfactual Path Engine</div>
        <p style={styles.muted}>Select missing skills and simulate impact.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {skillGap.map((s, i) => (
            <button
              key={i}
              style={{
                ...styles.button,
                background: counterfactualSkills.includes(s) ? "#dbeafe" : "#eff6ff",
                borderColor: counterfactualSkills.includes(s) ? "#60a5fa" : "#bfdbfe"
              }}
              onClick={() => toggleCounterfactualSkill(s)}
            >
              {counterfactualSkills.includes(s) ? "Selected: " : ""}{s}
            </button>
          ))}
        </div>
        <button
          style={{ ...styles.button, marginTop: "10px" }}
          onClick={runCounterfactual}
          disabled={runningCounterfactual || !counterfactualSkills.length}
        >
          {runningCounterfactual ? "Simulating..." : "Run Counterfactual"}
        </button>

        {counterfactualData && (
          <div style={{ marginTop: "10px", border: "1px solid #dbeafe", borderRadius: "10px", padding: "10px", background: "#f8fbff" }}>
            <div style={{ fontWeight: 700 }}>
              Readiness: {counterfactualData.currentReadiness}% -> {counterfactualData.projectedReadiness}% (+{counterfactualData.readinessDelta}%)
            </div>
            <div style={styles.muted}>Added Skills: {counterfactualData.addedSkills.join(", ")}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentGraphInsights;
