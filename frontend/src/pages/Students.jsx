import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentCard from "../components/StudentCard";
import api from "../services/api";

function Students() {
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/students")
      .then(res => setStudents(res.data))
      .catch(err => console.error(err));
  }, []);

  const container = {
    padding: "40px"
  };

  const header = {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "30px"
  };

  const grid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "25px"
  };

  return (
    <div style={container}>
      <div style={header}>Students</div>

      <div style={grid}>
        {students.map(student => (
          <StudentCard
            key={student.id}
            student={student}
            onClick={() => navigate(`/students/${student.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

export default Students;
