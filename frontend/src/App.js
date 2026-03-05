import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentDetails from "./pages/StudentDetails";
import Faculty from "./pages/Faculty";
import FacultyDetails from "./pages/FacultyDetails";
import GraphView from "./pages/GraphView";
import StudentGraphInsights from "./pages/StudentGraphInsights";
import Login from "./pages/Login";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students"
              element={
                <ProtectedRoute>
                  <Students />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/:id"
              element={
                <ProtectedRoute>
                  <StudentDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/:id/graph-insights"
              element={
                <ProtectedRoute>
                  <StudentGraphInsights />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty"
              element={
                <ProtectedRoute>
                  <Faculty />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/:id"
              element={
                <ProtectedRoute>
                  <FacultyDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/graph/student/:id"
              element={
                <ProtectedRoute>
                  <GraphView />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
