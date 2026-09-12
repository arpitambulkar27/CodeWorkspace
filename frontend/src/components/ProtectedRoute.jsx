// frontend/src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-white text-sm">
        Loading CodeFlow...
      </div>
    );
  }

  // If user is not logged in, redirect straight to /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}