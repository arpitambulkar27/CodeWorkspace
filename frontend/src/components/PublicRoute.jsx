// frontend/src/components/PublicRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-white text-sm font-sans">
        Loading CodeForge...
      </div>
    );
  }

  // If user is already logged in, redirect directly to /dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
