import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Workspace from "./pages/Workspace";
import DsaSheets from "./pages/DsaSheets";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Landing Page Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />

          {/* Inline Auth Landing Page Redirects */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LandingPage initialAuthMode="login" />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <LandingPage initialAuthMode="signup" />
              </PublicRoute>
            }
          />

          {/* Protected Application Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sheets"
            element={
              <ProtectedRoute>
                <DsaSheets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspace"
            element={
              <ProtectedRoute>
                <Workspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspace/:id"
            element={
              <ProtectedRoute>
                <Workspace />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}