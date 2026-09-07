// frontend/src/pages/GithubCallback.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function GithubCallback() {
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Authenticating with GitHub...");
  const { loginWithGithub } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    const errorParam = params.get("error");
    const errorDescription = params.get("error_description");

    if (errorParam || errorDescription) {
      setError(errorDescription || "GitHub authorization was denied or failed.");
      return;
    }

    if (!code) {
      setError("No GitHub authorization code found in URL parameters.");
      return;
    }

    let isMounted = true;

    const handleCallback = async () => {
      try {
        setStatus("Verifying GitHub credentials...");
        await loginWithGithub(code);
        if (isMounted) {
          setStatus("GitHub Authentication successful! Redirecting to Dashboard...");
          setTimeout(() => {
            navigate("/dashboard", { replace: true });
          }, 600);
        }
      } catch (err) {
        console.error("GitHub OAuth Callback Error:", err);
        if (isMounted) {
          setError(
            err.response?.data?.error || "GitHub authentication failed. Please try again."
          );
        }
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [location.search, loginWithGithub, navigate]);

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#07090e",
      color: "#e6edf3",
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div style={{
        backgroundColor: "#0d1117",
        border: "1px solid #21262d",
        borderRadius: "16px",
        padding: "36px 40px",
        maxWidth: "420px",
        width: "90%",
        textAlign: "center",
        boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
      }}>
        {error ? (
          <div>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "rgba(248, 81, 73, 0.15)",
              border: "1px solid rgba(248, 81, 73, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto"
            }}>
              <AlertCircle size={24} color="#f85149" />
            </div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", color: "#ffffff", fontWeight: "bold" }}>
              GitHub Authentication Failed
            </h3>
            <p style={{ fontSize: "13px", color: "#8b949e", lineHeight: "1.5", margin: "0 0 20px 0" }}>
              {error}
            </p>
            <button
              onClick={() => navigate("/login")}
              style={{
                backgroundColor: "#238636",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "13px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Return to Login
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
              <Loader2 size={32} className="animate-spin" color="#58a6ff" />
            </div>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "17px", color: "#ffffff", fontWeight: "bold" }}>
              Authenticating with GitHub
            </h3>
            <p style={{ fontSize: "13px", color: "#8b949e", margin: 0 }}>
              {status}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
