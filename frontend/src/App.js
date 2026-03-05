import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentDetails from "./pages/StudentDetails";
import Faculty from "./pages/Faculty";
import FacultyDetails from "./pages/FacultyDetails";
import GraphView from "./pages/GraphView";
import ResumeTest from "./pages/ResumeTest";
import StudentGraphInsights from "./pages/StudentGraphInsights";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/resume-test" element={<ResumeTest />} />

        <Route path="/" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/students/:id" element={<StudentDetails />} />
        <Route path="/students/:id/graph-insights" element={<StudentGraphInsights />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/faculty/:id" element={<FacultyDetails />} />
        <Route path="/graph/student/:id" element={<GraphView />} />
      </Routes>
    </Router>
  );
}

export default App;
