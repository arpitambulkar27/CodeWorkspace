import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Code2, User, Mail, Lock, ArrowRight, ShieldCheck, Cpu, 
  Zap, Eye, EyeOff, AlertCircle, Loader2, Sparkles, CheckCircle2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || username.trim().length < 3 || username.trim().length > 20) {
      setError("Username must be between 3 and 20 characters.");
      return;
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      await register(username.trim(), email, password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error || "Registration failed. Please try again."
      );
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

        /* Ambient Glow Background Orbs */
        .cf-ambient-orb-1 {
          position: absolute;
          top: -150px;
          right: -100px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(147, 51, 234, 0.18) 0%, rgba(7, 9, 14, 0) 70%);
          pointer-events: none;
        }
        .cf-ambient-orb-2 {
          position: absolute;
          bottom: -150px;
          left: -100px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(7, 9, 14, 0) 70%);
          pointer-events: none;
        }

        /* Grid Background Pattern */
        .cf-bg-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(#1e293b 1px, transparent 1px);
          background-size: 32px 32px;
          opacity: 0.15;
          pointer-events: none;
        }

        /* Left SaaS Showcase Panel */
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
          margin-bottom: 18px;
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

        /* Vibrant Focus & Hover Input Effect */
        .cf-input-field:hover {
          border-color: #a371f7;
          background-color: #111622;
          box-shadow: 0 0 16px rgba(163, 113, 247, 0.25), inset 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .cf-input-field:focus {
          border-color: #bc8cff;
          background-color: #111622;
          box-shadow: 0 0 0 3px rgba(188, 140, 255, 0.25), 0 0 20px rgba(163, 113, 247, 0.35);
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
          color: #bc8cff;
        }

        .cf-btn-submit {
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, #9333ea 0%, #a855f7 50%, #7e22ce 100%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: #ffffff;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 24px -4px rgba(147, 51, 234, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 10px;
        }

        .cf-btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px -4px rgba(147, 51, 234, 0.6);
          filter: brightness(1.1);
        }

        .cf-btn-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .cf-btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cf-auth-card {
          background-color: rgba(13, 17, 23, 0.85);
          border: 1px solid #21262d;
          border-radius: 20px;
          padding: 40px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(147, 51, 234, 0.08);
          backdrop-filter: blur(16px);
          position: relative;
          z-index: 20;
          transition: border-color 0.3s ease;
        }
        .cf-auth-card:hover {
          border-color: rgba(163, 113, 247, 0.4);
        }
      `}</style>

      <div className="cf-bg-grid" />
      <div className="cf-ambient-orb-1" />
      <div className="cf-ambient-orb-2" />

      {/* 🟢 LEFT SHOWCASE PANEL */}
      <div className="cf-auth-left">
        {/* Brand Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "10px", backgroundColor: "rgba(163, 113, 247, 0.15)", borderRadius: "12px", border: "1px solid rgba(163, 113, 247, 0.3)" }}>
            <Code2 size={26} color="#a371f7" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "800", letterSpacing: "-0.5px", color: "#ffffff" }}>CodeForge</h1>
            <span style={{ fontSize: "11px", color: "#a371f7", fontWeight: "bold" }}>Cloud IDE & Technical Interview Platform</span>
          </div>
        </div>

        {/* Feature Showcase Hero */}
        <div style={{ margin: "auto 0", maxWidth: "520px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "20px", backgroundColor: "rgba(163, 113, 247, 0.12)", border: "1px solid rgba(163, 113, 247, 0.25)", color: "#a371f7", fontSize: "12px", fontWeight: "bold", marginBottom: "20px" }}>
            <Sparkles size={14} /> Instant Developer Onboarding
          </div>

          <h2 style={{ fontSize: "36px", fontWeight: "900", color: "#ffffff", lineHeight: "1.25", letterSpacing: "-0.8px", margin: "0 0 16px 0" }}>
            Build, Execute & Review Code in Seconds
          </h2>
          <p style={{ fontSize: "14px", color: "#8b949e", lineHeight: "1.6", margin: "0 0 28px 0" }}>
            Get instant access to multi-language sandboxes, multiplayer room collaboration, and AI-powered static analysis.
          </p>

          {/* Feature Cards Grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ backgroundColor: "#0d1117", border: "1px solid #21262d", borderRadius: "14px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(63, 185, 80, 0.15)", border: "1px solid rgba(63, 185, 80, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 size={18} color="#3fb950" />
              </div>
              <div>
                <h4 style={{ margin: "0 0 2px 0", fontSize: "14px", fontWeight: "bold", color: "#ffffff" }}>Isolated Docker Containers</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#8b949e" }}>Python, JavaScript, Java, and C++ runtimes</p>
              </div>
            </div>

            <div style={{ backgroundColor: "#0d1117", border: "1px solid #21262d", borderRadius: "14px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(163, 113, 247, 0.15)", border: "1px solid rgba(163, 113, 247, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={18} color="#a371f7" />
              </div>
              <div>
                <h4 style={{ margin: "0 0 2px 0", fontSize: "14px", fontWeight: "bold", color: "#ffffff" }}>Gemini AI Code Reviewer</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#8b949e" }}>Automated bug detection and Big-O complexity analysis</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Highlights */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px", paddingTop: "24px", borderTop: "1px solid #1e293b", fontSize: "12px", color: "#8b949e" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={16} color="#3fb950" /> Secure JWT Auth
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Cpu size={16} color="#a371f7" /> Asynchronous BullMQ
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Zap size={16} color="#d29922" /> Socket.io WebSockets
          </div>
        </div>
      </div>

      {/* 🔵 RIGHT AUTH FORM PANEL */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyCenter: "center", justifyContent: "center", padding: "40px 24px", position: "relative", zIndex: 20 }}>
        
        <div className="cf-auth-card">
          <div style={{ marginBottom: "26px" }}>
            <h2 style={{ margin: "0 0 8px 0", fontSize: "28px", fontWeight: "900", letterSpacing: "-0.5px", color: "#ffffff" }}>
              Create Account
            </h2>
            <p style={{ margin: 0, fontSize: "14px", color: "#8b949e" }}>
              Start building inside your isolated cloud workspace
            </p>
          </div>

          {error && (
            <div style={{ padding: "14px 16px", backgroundColor: "rgba(248, 81, 73, 0.15)", border: "1px solid rgba(248, 81, 73, 0.4)", borderRadius: "12px", color: "#f85149", fontSize: "13px", fontWeight: "600", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="cf-input-wrapper">
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "#c9d1d9", marginBottom: "6px", letterSpacing: "0.5px" }}>
                Username
              </label>
              <User className="cf-input-icon" size={18} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Arpit"
                className="cf-input-field"
              />
            </div>

            <div className="cf-input-wrapper">
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "#c9d1d9", marginBottom: "6px", letterSpacing: "0.5px" }}>
                Work Email
              </label>
              <Mail className="cf-input-icon" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@codeforge.io"
                className="cf-input-field"
              />
            </div>

            <div className="cf-input-wrapper">
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "#c9d1d9", marginBottom: "6px", letterSpacing: "0.5px" }}>
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
                style={{ position: "absolute", right: "14px", top: "38px", background: "none", border: "none", color: "#8b949e", cursor: "pointer", padding: 0 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" disabled={loading} className="cf-btn-submit">
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Creating Account...
                </>
              ) : (
                <>
                  <span>Get Started for Free</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "24px", paddingTop: "18px", borderTop: "1px solid #21262d" }}>
            <p style={{ margin: 0, fontSize: "14px", color: "#8b949e" }}>
              Already registered?{" "}
              <Link to="/login" style={{ color: "#a371f7", fontWeight: "bold", textDecoration: "none", transition: "color 0.2s ease" }}>
                Sign In
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}