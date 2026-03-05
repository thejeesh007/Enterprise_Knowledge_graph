import React from "react";

function FacultyCard({ faculty, onClick }) {
  const card = {
    padding: "22px",
    borderRadius: "14px",
    border: "1px solid var(--border-color)",
    backgroundColor: "var(--card-bg)",
    boxShadow: "var(--shadow-soft)",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease"
  };

  const name = {
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "4px"
  };

  const sub = {
    fontSize: "14px",
    color: "var(--text-muted)"
  };

  const row = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "14px"
  };

  const chip = {
    padding: "6px 12px",
    borderRadius: "20px",
    backgroundColor: "var(--accent-soft)",
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--text-primary)"
  };

  const badge = {
    padding: "6px 14px",
    borderRadius: "20px",
    backgroundColor: "var(--accent-primary)",
    color: "white",
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
      <div style={name}>{faculty.name}</div>
      <div style={sub}>{faculty.designation}</div>
      <div style={sub}>{faculty.department}</div>

      <div style={row}>
        <div style={chip}>{faculty.years_of_experience} yrs exp</div>
        <div style={badge}>H-index {faculty.h_index}</div>
      </div>
    </div>
  );
}

export default FacultyCard;
