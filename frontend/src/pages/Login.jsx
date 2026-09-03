import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Code2, Mail, Lock, ArrowRight, ShieldCheck, Cpu, 
  Zap, Eye, EyeOff, AlertCircle, Loader2, Sparkles, Terminal
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Strict RFC 5322 Email Regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, socialLogin } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (val) => {
    const trimmed = (val || "").trim();
    if (!trimmed) {
      return "Email address is required.";
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      return "Please enter a valid email address with a recognized domain (e.g. developer@example.com).";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      await login(email.trim().toLowerCase(), password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error || "Invalid credentials. Please verify your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider) => {
    setError("");
    const inputEmail = window.prompt(`Enter your ${provider === "google" ? "Google Account" : "GitHub"} Email address:`);
    if (!inputEmail) return;

    const emailErr = validateEmail(inputEmail);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    try {
      setLoading(true);
      const defaultUsername = inputEmail.split("@")[0] || `${provider}_user`;
      await socialLogin(provider, inputEmail.trim().toLowerCase(), defaultUsername);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || `${provider} sign-in failed.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cf-auth-root">
      <style>{`
        .cf-auth-root {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          background-color: #07090e;
          color: #e6edf3;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          overflow: hidden;
          position: relative;
        }

        .cf-ambient-orb-1 {
          position: absolute;
          top: -150px;
          left: -100px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, rgba(7, 9, 14, 0) 70%);
          pointer-events: none;
        }
        .cf-ambient-orb-2 {
          position: absolute;
          bottom: -150px;
          right: -100px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, rgba(7, 9, 14, 0) 70%);
          pointer-events: none;
        }

        .cf-bg-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(#1e293b 1px, transparent 1px);
          background-size: 32px 32px;
          opacity: 0.15;
          pointer-events: none;
        }

        .cf-auth-left {
          flex: 1.1;
          background: linear-gradient(135deg, #0b0f19 0%, #080c14 100%);
          border-right: 1px solid #1e293b;
          padding: 50px 60px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          z-index: 10;
        }

        @media (max-width: 1024px) {
          .cf-auth-left { display: none; }
        }

        .cf-input-wrapper {
          position: relative;
          width: 100%;
          margin-bottom: 20px;
        }

        .cf-input-field {
          width: 100%;
          box-sizing: border-box;
          padding: 14px 16px 14px 44px;
          background-color: #0d1117;
          border: 1px solid #21262d;
          border-radius: 12px;
          color: #f0f6fc;
          font-size: 14px;
          outline: none;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .cf-input-field::placeholder {
          color: #6e7681;
        }

        .cf-input-field:hover {
          border-color: #388bfd;
          background-color: #111622;
          box-shadow: 0 0 16px rgba(56, 139, 253, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .cf-input-field:focus {
          border-color: #58a6ff;
          background-color: #111622;
          box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.25), 0 0 20px rgba(56, 139, 253, 0.3);
        }

        .cf-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #8b949e;
          transition: color 0.25s ease;
          pointer-events: none;
        }

        .cf-input-wrapper:focus-within .cf-input-icon {
          color: #58a6ff;
        }

        .cf-btn-submit {
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #1d4ed8 100%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: #ffffff;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 24px -4px rgba(37, 99, 235, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 10px;
        }

        .cf-btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px -4px rgba(37, 99, 235, 0.6);
          filter: brightness(1.1);
        }

        .cf-social-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px 16px;
          background-color: #0d1117;
          border: 1px solid #30363d;
          border-radius: 12px;
          color: #f0f6fc;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .cf-social-btn:hover {
          background-color: #161b22;
          border-color: #58a6ff;
          transform: translateY(-1px);
        }

        .cf-auth-card {
          background-color: rgba(13, 17, 23, 0.85);
          border: 1px solid #21262d;
          border-radius: 20px;
          padding: 40px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 139, 253, 0.08);
          backdrop-filter: blur(16px);
          position: relative;
          z-index: 20;
          transition: border-color 0.3s ease;
        }
        .cf-auth-card:hover {
          border-color: rgba(56, 139, 253, 0.4);
        }
      `}</style>

      <div className="cf-bg-grid" />
      <div className="cf-ambient-orb-1" />
      <div className="cf-ambient-orb-2" />

      {/* 🟢 LEFT SHOWCASE PANEL */}
      <div className="cf-auth-left">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "10px", backgroundColor: "rgba(56, 139, 253, 0.15)", borderRadius: "12px", border: "1px solid rgba(56, 139, 253, 0.3)" }}>
            <Code2 size={26} color="#58a6ff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "800", letterSpacing: "-0.5px", color: "#ffffff" }}>CodeForge</h1>
            <span style={{ fontSize: "11px", color: "#58a6ff", fontWeight: "bold" }}>Cloud IDE & Technical Interview Platform</span>
          </div>
        </div>

        <div style={{ margin: "auto 0", maxWidth: "520px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "20px", backgroundColor: "rgba(56, 139, 253, 0.12)", border: "1px solid rgba(56, 139, 253, 0.25)", color: "#58a6ff", fontSize: "12px", fontWeight: "bold", marginBottom: "20px" }}>
            <Sparkles size={14} /> Next-Gen Developer Workspaces
          </div>

          <h2 style={{ fontSize: "36px", fontWeight: "900", color: "#ffffff", lineHeight: "1.25", letterSpacing: "-0.8px", margin: "0 0 16px 0" }}>
            Isolated Execution Sandboxes on Demand
          </h2>
          <p style={{ fontSize: "14px", color: "#8b949e", lineHeight: "1.6", margin: "0 0 28px 0" }}>
            Experience zero-latency real-time pair programming, sandboxed Docker code execution, and Gemini AI-powered automated code reviews.
          </p>

          <div style={{ backgroundColor: "#0d1117", border: "1px solid #21262d", borderRadius: "14px", overflow: "hidden", boxShadow: "0 16px 36px rgba(0, 0, 0, 0.5)" }}>
            <div style={{ backgroundColor: "#161b22", padding: "10px 16px", borderBottom: "1px solid #21262d", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "6px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ff5f56" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ffbd2e" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#27c93f" }} />
              </div>
              <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#8b949e", display: "flex", alignItems: "center", gap: "6px" }}>
                <Terminal size={12} color="#58a6ff" /> main.py — Docker Runner
              </span>
            </div>
            <div style={{ padding: "16px", fontFamily: "Consolas, Monaco, monospace", fontSize: "12px", color: "#e6edf3", lineHeight: "1.7" }}>
              <p style={{ margin: 0, color: "#8b949e" }}># Booting ephemeral container...</p>
              <p style={{ margin: "4px 0" }}><span style={{ color: "#a371f7" }}>import</span> <span style={{ color: "#79c0ff" }}>codeforge</span></p>
              <p style={{ margin: "4px 0" }}><span style={{ color: "#79c0ff" }}>sandbox</span> = codeforge.<span style={{ color: "#7ee787" }}>mount</span>(<span style={{ color: "#a5d6ff" }}>"python:3.10-slim"</span>)</p>
              <p style={{ margin: "8px 0 0 0", color: "#3fb950", fontWeight: "bold" }}>✓ Container initialized in 0.18s [Memory: 128MB | CPU: 0.5]</p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "24px", paddingTop: "24px", borderTop: "1px solid #1e293b", fontSize: "12px", color: "#8b949e" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={16} color="#3fb950" /> Ephemeral Isolation
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Cpu size={16} color="#58a6ff" /> BullMQ Task Queues
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Zap size={16} color="#d29922" /> Socket.io Multiplayer
          </div>
        </div>
      </div>

      {/* 🔵 RIGHT AUTH FORM PANEL (EMAIL & PASSWORD AT TOP, GOOGLE & GITHUB AT BOTTOM) */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", position: "relative", zIndex: 20 }}>
        
        <div className="cf-auth-card">
          <div style={{ marginBottom: "26px" }}>
            <h2 style={{ margin: "0 0 8px 0", fontSize: "28px", fontWeight: "900", letterSpacing: "-0.5px", color: "#ffffff" }}>
              Sign in to CodeForge
            </h2>
            <p style={{ margin: 0, fontSize: "14px", color: "#8b949e" }}>
              Enter your validated email and password to launch your cloud IDE
            </p>
          </div>

          {error && (
            <div style={{ padding: "14px 16px", backgroundColor: "rgba(248, 81, 73, 0.15)", border: "1px solid rgba(248, 81, 73, 0.4)", borderRadius: "12px", color: "#f85149", fontSize: "13px", fontWeight: "600", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* 1. EMAIL & PASSWORD FORM AT THE TOP OF CARD */}
          <form onSubmit={handleSubmit}>
            <div className="cf-input-wrapper">
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "#c9d1d9", marginBottom: "8px", letterSpacing: "0.5px" }}>
                Work Email
              </label>
              <Mail className="cf-input-icon" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="cf-input-field"
              />
            </div>

            <div className="cf-input-wrapper">
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "#c9d1d9", marginBottom: "8px", letterSpacing: "0.5px" }}>
                Password
              </label>
              <Lock className="cf-input-icon" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="cf-input-field"
                style={{ paddingRight: "44px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "14px", top: "40px", background: "none", border: "none", color: "#8b949e", cursor: "pointer", padding: 0 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" disabled={loading} className="cf-btn-submit">
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* 2. OR DIVIDER AND GOOGLE & GITHUB SOCIAL BUTTONS AT BOTTOM OF CARD */}
          <div style={{ display: "flex", alignItems: "center", margin: "24px 0 18px 0" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#21262d" }} />
            <span style={{ padding: "0 14px", fontSize: "11px", color: "#8b949e", fontWeight: "700", letterSpacing: "0.08em" }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#21262d" }} />
          </div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
            {/* GOOGLE SIGN IN BUTTON */}
            <button
              type="button"
              onClick={() => handleSocialAuth("google")}
              disabled={loading}
              className="cf-social-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
              </svg>
              <span>Google</span>
            </button>

            {/* GITHUB SIGN IN BUTTON */}
            <button
              type="button"
              onClick={() => handleSocialAuth("github")}
              disabled={loading}
              className="cf-social-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          <div style={{ textAlign: "center", paddingTop: "18px", borderTop: "1px solid #21262d" }}>
            <p style={{ margin: 0, fontSize: "14px", color: "#8b949e" }}>
              Don't have an account yet?{" "}
              <Link to="/signup" style={{ color: "#58a6ff", fontWeight: "bold", textDecoration: "none", transition: "color 0.2s ease" }}>
                Create Account
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}