import React from "react";

function FacultyCard({ faculty, onClick }) {
  const card = {
    padding: "22px",
    borderRadius: "14px",
    border: "1px solid #e0e0e0",
    backgroundColor: "#ffffff",
    boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
    cursor: "pointer",
    transition: "transform 0.2s ease"
  };

  const name = {
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "4px"
  };

  const sub = {
    fontSize: "14px",
    color: "#555"
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
    backgroundColor: "#eef2ff",
    fontSize: "13px",
    fontWeight: "500"
  };

  const badge = {
    padding: "6px 14px",
    borderRadius: "20px",
    backgroundColor: "#2f5fff",
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
