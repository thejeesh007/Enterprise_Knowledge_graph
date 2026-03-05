import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentCard from "../components/StudentCard";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Students() {
  const [students, setStudents] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");
  const [studentForm, setStudentForm] = useState({
    id: "",
    name: "",
    dept: "",
    year: "",
    university_id: "",
    enrollment_year: "",
    gpa: "",
    career_goal: "",
    program: "",
    email: "",
    country: "",
    interestsCsv: "",
    skillsCsv: ""
  });
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const fetchStudents = () => {
    api
      .get("/students")
      .then((res) => setStudents(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const onFormChange = (field, value) => {
    setStudentForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setStudentForm({
      id: "",
      name: "",
      dept: "",
      year: "",
      university_id: "",
      enrollment_year: "",
      gpa: "",
      career_goal: "",
      program: "",
      email: "",
      country: "",
      interestsCsv: "",
      skillsCsv: ""
    });
  };

  const submitStudent = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    const payload = {
      id: Number(studentForm.id),
      name: studentForm.name.trim(),
      dept: studentForm.dept.trim(),
      year: Number(studentForm.year),
      university_id: studentForm.university_id.trim(),
      enrollment_year: Number(studentForm.enrollment_year),
      gpa: Number(studentForm.gpa),
      career_goal: studentForm.career_goal.trim(),
      program: studentForm.program.trim(),
      email: studentForm.email.trim(),
      country: studentForm.country.trim(),
      interests: studentForm.interestsCsv
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      skills: studentForm.skillsCsv
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
    };

    try {
      setSubmitting(true);
      setAdminMessage("");
      await api.post("/admin/students", payload);
      setAdminMessage("Student created and saved to Neo4j.");
      resetForm();
      fetchStudents();
    } catch (err) {
      setAdminMessage(err?.response?.data?.error || "Failed to create student");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteStudent = async (studentId) => {
    if (!isAdmin) return;
    const ok = window.confirm(`Delete student ${studentId}? This will remove the node and relations from Neo4j.`);
    if (!ok) return;
    try {
      await api.delete(`/admin/students/${studentId}`);
      setAdminMessage(`Student ${studentId} deleted from Neo4j.`);
      fetchStudents();
    } catch (err) {
      setAdminMessage(err?.response?.data?.error || "Failed to delete student");
    }
  };

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
      gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
      gap: "20px"
    },
    adminCard: {
      marginBottom: "20px",
      padding: "16px",
      borderRadius: "12px",
      border: "1px solid var(--border-color)",
      background: "var(--card-bg)"
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "10px"
    },
    input: {
      width: "100%",
      borderRadius: "8px",
      border: "1px solid var(--border-color)",
      padding: "8px 10px",
      fontSize: "13px",
      background: "var(--bg-main)",
      color: "var(--text-primary)"
    },
    button: {
      padding: "9px 12px",
      borderRadius: "8px",
      border: "1px solid var(--accent-primary)",
      background: "var(--accent-primary)",
      color: "#fff",
      fontWeight: 700,
      fontSize: "12px",
      cursor: "pointer"
    },
    dangerButton: {
      marginTop: "8px",
      padding: "8px 10px",
      borderRadius: "8px",
      border: "1px solid #dc2626",
      background: "#dc2626",
      color: "#fff",
      fontWeight: 700,
      fontSize: "12px",
      cursor: "pointer"
    },
    studentCardWrap: {
      display: "flex",
      flexDirection: "column"
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

        {isAdmin && (
          <div style={styles.adminCard}>
            <h3 style={{ marginTop: 0, color: "var(--text-primary)" }}>Admin: Add Student (Neo4j Direct)</h3>
            <form onSubmit={submitStudent}>
              <div style={styles.formGrid}>
                <input style={styles.input} placeholder="ID*" value={studentForm.id} onChange={(e) => onFormChange("id", e.target.value)} />
                <input style={styles.input} placeholder="Name*" value={studentForm.name} onChange={(e) => onFormChange("name", e.target.value)} />
                <input style={styles.input} placeholder="Department*" value={studentForm.dept} onChange={(e) => onFormChange("dept", e.target.value)} />
                <input style={styles.input} placeholder="Year*" value={studentForm.year} onChange={(e) => onFormChange("year", e.target.value)} />
                <input style={styles.input} placeholder="University ID" value={studentForm.university_id} onChange={(e) => onFormChange("university_id", e.target.value)} />
                <input style={styles.input} placeholder="Enrollment Year" value={studentForm.enrollment_year} onChange={(e) => onFormChange("enrollment_year", e.target.value)} />
                <input style={styles.input} placeholder="GPA" value={studentForm.gpa} onChange={(e) => onFormChange("gpa", e.target.value)} />
                <input style={styles.input} placeholder="Career Goal*" value={studentForm.career_goal} onChange={(e) => onFormChange("career_goal", e.target.value)} />
                <input style={styles.input} placeholder="Program" value={studentForm.program} onChange={(e) => onFormChange("program", e.target.value)} />
                <input style={styles.input} placeholder="Email*" value={studentForm.email} onChange={(e) => onFormChange("email", e.target.value)} />
                <input style={styles.input} placeholder="Country" value={studentForm.country} onChange={(e) => onFormChange("country", e.target.value)} />
                <input style={styles.input} placeholder="Interests (comma-separated)" value={studentForm.interestsCsv} onChange={(e) => onFormChange("interestsCsv", e.target.value)} />
                <input style={styles.input} placeholder="Skills (comma-separated)" value={studentForm.skillsCsv} onChange={(e) => onFormChange("skillsCsv", e.target.value)} />
              </div>
              <div style={{ marginTop: "10px", display: "flex", gap: "8px", alignItems: "center" }}>
                <button style={styles.button} type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Add Student"}
                </button>
                {adminMessage ? <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>{adminMessage}</span> : null}
              </div>
            </form>
          </div>
        )}

        <div style={styles.grid}>
          {students.map((student) => (
            <div key={student.id} style={styles.studentCardWrap}>
              <StudentCard student={student} onClick={() => navigate(`/students/${student.id}`)} />
              {isAdmin && (
                <button style={styles.dangerButton} onClick={() => deleteStudent(student.id)}>
                  Delete Student
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Students;
