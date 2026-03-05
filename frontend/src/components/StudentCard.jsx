import React from "react";

function StudentCard({ student, onClick }) {
  const card = {
    padding: "22px",
    borderRadius: "14px",
    border: "1px solid var(--border-color)",
    backgroundColor: "var(--card-bg)",
    boxShadow: "var(--shadow-soft)",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  };

  const header = {
    marginBottom: "12px"
  };

  const name = {
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "4px"
  };

  const subText = {
    fontSize: "14px",
    color: "var(--text-muted)"
  };

  const chipRow = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "16px"
  };

  const chip = {
    padding: "6px 12px",
    borderRadius: "20px",
    backgroundColor: "var(--accent-soft)",
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--text-primary)"
  };

  const gpaBadge = {
    padding: "6px 14px",
    borderRadius: "20px",
    backgroundColor: "var(--accent-primary)",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "700"
  };

  return (
    <div
      style={card}
      onClick={onClick}
      onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
      onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
    >
      {/* Top */}
      <div style={header}>
        <div style={name}>{student.name}</div>
        <div style={subText}>
          {student.program} • {student.dept}
        </div>
      </div>

      {/* Bottom */}
      <div style={chipRow}>
        <div style={chip}>Year {student.year}</div>
        <div style={gpaBadge}>GPA {student.gpa}</div>
      </div>
    </div>
  );
}

export default StudentCard;
