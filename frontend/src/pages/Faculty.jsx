import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import FacultyCard from "../components/FacultyCard";

function Faculty() {
  const [faculty, setFaculty] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/faculty").then(res => setFaculty(res.data));
  }, []);

  const grid = {
    padding: "40px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "25px"
  };

  return (
    <div style={grid}>
      {faculty.map(f => (
        <FacultyCard
          key={f.id}
          faculty={f}
          onClick={() => navigate(`/faculty/${f.id}`)}
        />
      ))}
    </div>
  );
}

export default Faculty;
