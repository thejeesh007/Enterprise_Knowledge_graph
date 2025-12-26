import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentDetails from "./pages/StudentDetails";
import Faculty from "./pages/Faculty";
import FacultyDetails from "./pages/FacultyDetails";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/students/:id" element={<StudentDetails />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/faculty/:id" element={<FacultyDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
