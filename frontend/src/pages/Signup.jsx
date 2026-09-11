import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { 
  Code2, User, Mail, Lock, ArrowRight, ShieldCheck, Cpu, 
  Zap, Eye, EyeOff, AlertCircle, Loader2, Sparkles, KeyRound, RefreshCw, CheckCircle2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Strict RFC 5322 Email Regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP Verification View State
  const [showOtpView, setShowOtpView] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSuccessMsg, setOtpSuccessMsg] = useState("");

  const { register, sendOtp, verifyOtp, loginWithGoogle, socialLogin } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      if (credentialResponse.credential) {
        await loginWithGoogle(credentialResponse.credential);
        navigate("/");
      }
    } catch (err) {
      console.error("Google Auth Error:", err);
      setError(
        err.response?.data?.error || "Google sign-up failed. Token validation error."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || "";
    const redirectUri = `${window.location.origin}/auth/github/callback`;
    const scope = "read:user user:email";
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
  };

  const handleGoogleError = () => {
    setError("Google Sign-Up failed or was cancelled.");
  };

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
    setOtpSuccessMsg("");

    if (!username || username.trim().length < 2 || username.trim().length > 50) {
      setError("Username must be between 2 and 50 characters.");
      return;
    }

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
      const res = await register(username.trim(), email.trim().toLowerCase(), password);
      if (res && res.requiresOtp) {
        setShowOtpView(true);
        setOtpSuccessMsg(`A 6-digit verification code was sent to ${email.trim().toLowerCase()}.`);
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setOtpSuccessMsg("");

    const cleanOtp = (otpCode || "").trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(email.trim().toLowerCase(), cleanOtp);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error || "Invalid or expired verification OTP code."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setOtpSuccessMsg("");
    setLoading(true);
    try {
      await sendOtp(email.trim().toLowerCase());
      setOtpSuccessMsg("A new 6-digit OTP code has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend OTP code.");
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
          background: radial-gradient(circle, rgba(147, 51, 234, 0.18) 0%, rgba(7, 9, 14, 0) 70%);
          pointer-events: none;
        }
        .cf-ambient-orb-2 {
          position: absolute;
          bottom: -150px;
          right: -100px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(7, 9, 14, 0) 70%);
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
          justify-space-between;
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
          padding: 13px 16px 13px 44px;
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
          border-color: #a371f7;
          background-color: #111622;
          box-shadow: 0 0 16px rgba(163, 113, 247, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .cf-input-field:focus {
          border-color: #bc8cff;
          background-color: #111622;
          box-shadow: 0 0 0 3px rgba(188, 140, 255, 0.25), 0 0 20px rgba(163, 113, 247, 0.3);
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
          background: linear-gradient(135deg, #8957e5 0%, #a371f7 50%, #6e40c9 100%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: #ffffff;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 24px -4px rgba(137, 87, 229, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 10px;
        }

        .cf-btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px -4px rgba(137, 87, 229, 0.6);
          filter: brightness(1.1);
        }

        .cf-social-btn {
          width: 100%;
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
          border-color: #bc8cff;
          transform: translateY(-1px);
        }

        .cf-auth-card {
          background-color: rgba(13, 17, 23, 0.85);
          border: 1px solid #21262d;
          border-radius: 20px;
          padding: 40px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(163, 113, 247, 0.08);
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

      {/* LEFT SHOWCASE PANEL */}
      <div className="cf-auth-left">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "10px", backgroundColor: "rgba(163, 113, 247, 0.15)", borderRadius: "12px", border: "1px solid rgba(163, 113, 247, 0.3)" }}>
            <Code2 size={26} color="#a371f7" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "800", letterSpacing: "-0.5px", color: "#ffffff" }}>CodeForge</h1>
            <span style={{ fontSize: "11px", color: "#a371f7", fontWeight: "bold" }}>Cloud IDE & Technical Interview Platform</span>
          </div>
        </div>

        <div style={{ margin: "auto 0", maxWidth: "520px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "20px", backgroundColor: "rgba(163, 113, 247, 0.12)", border: "1px solid rgba(163, 113, 247, 0.25)", color: "#a371f7", fontSize: "12px", fontWeight: "bold", marginBottom: "20px" }}>
            <Sparkles size={14} /> Verified Developer Accounts
          </div>

          <h2 style={{ fontSize: "34px", fontWeight: "900", color: "#ffffff", lineHeight: "1.25", letterSpacing: "-0.8px", margin: "0 0 16px 0" }}>
            Build & Test Code in Ephemeral Containers
          </h2>
          <p style={{ fontSize: "14px", color: "#8b949e", lineHeight: "1.6", margin: "0 0 28px 0" }}>
            Create your account to unlock isolated Docker code execution, multi-language sandboxes, and AI automated code reviews.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#c9d1d9" }}>
              <ShieldCheck size={18} color="#3fb950" /> <span>OTP-backed email verification to stop spam</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#c9d1d9" }}>
              <Cpu size={18} color="#58a6ff" /> <span>Isolated Docker micro-containers for code execution</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#c9d1d9" }}>
              <Zap size={18} color="#d29922" /> <span>Real-time Socket.io collaborative pair programming</span>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: "24px", borderTop: "1px solid #1e293b", fontSize: "12px", color: "#8b949e" }}>
          © 2026 CodeForge Inc. All rights reserved.
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", position: "relative", zIndex: 20 }}>
        
        <div className="cf-auth-card">

          {/* 🟢 STEP 2: OTP VERIFICATION VIEW */}
          {showOtpView ? (
            <div>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "14px", backgroundColor: "rgba(163, 113, 247, 0.15)", border: "1px solid rgba(163, 113, 247, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
                  <KeyRound size={26} color="#a371f7" />
                </div>
                <h2 style={{ margin: "0 0 8px 0", fontSize: "24px", fontWeight: "900", color: "#ffffff" }}>
                  Verify Your Email
                </h2>
                <p style={{ margin: 0, fontSize: "13px", color: "#8b949e", lineHeight: "1.5" }}>
                  Enter the 6-digit verification code sent to <br />
                  <strong style={{ color: "#ffffff" }}>{email}</strong>
                </p>
              </div>

              {error && (
                <div style={{ padding: "12px 14px", backgroundColor: "rgba(248, 81, 73, 0.15)", border: "1px solid rgba(248, 81, 73, 0.4)", borderRadius: "12px", color: "#f85149", fontSize: "13px", fontWeight: "600", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {otpSuccessMsg && (
                <div style={{ padding: "12px 14px", backgroundColor: "rgba(46, 160, 67, 0.15)", border: "1px solid rgba(46, 160, 67, 0.4)", borderRadius: "12px", color: "#3fb950", fontSize: "13px", fontWeight: "600", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <CheckCircle2 size={18} />
                  <span>{otpSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp}>
                <div className="cf-input-wrapper">
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "#c9d1d9", marginBottom: "8px", letterSpacing: "0.5px" }}>
                    6-Digit OTP Code
                  </label>
                  <KeyRound className="cf-input-icon" size={18} />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="cf-input-field"
                    style={{ letterSpacing: "6px", fontSize: "18px", fontWeight: "bold", textAlign: "center", paddingLeft: "16px" }}
                  />
                </div>

                <button type="submit" disabled={loading} className="cf-btn-submit">
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Verifying OTP...
                    </>
                  ) : (
                    <>
                      <span>Verify & Launch Workspace</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #21262d", fontSize: "13px" }}>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  style={{ background: "none", border: "none", color: "#a371f7", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <RefreshCw size={14} /> Resend OTP Code
                </button>

                <span 
                  onClick={() => setShowOtpView(false)} 
                  style={{ color: "#8b949e", cursor: "pointer", textDecoration: "underline" }}
                >
                  Change Email
                </span>
              </div>
            </div>
          ) : (
            /* 🔵 STEP 1: INITIAL SIGNUP FORM */
            <div>
              <div style={{ marginBottom: "22px" }}>
                <h2 style={{ margin: "0 0 8px 0", fontSize: "28px", fontWeight: "900", letterSpacing: "-0.5px", color: "#ffffff" }}>
                  Create an Account
                </h2>
                <p style={{ margin: 0, fontSize: "14px", color: "#8b949e" }}>
                  Enter your details to receive your 6-digit email verification code
                </p>
              </div>

              {error && (
                <div style={{ padding: "12px 14px", backgroundColor: "rgba(248, 81, 73, 0.15)", border: "1px solid rgba(248, 81, 73, 0.4)", borderRadius: "12px", color: "#f85149", fontSize: "13px", fontWeight: "600", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="cf-input-wrapper">
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "#c9d1d9", marginBottom: "8px", letterSpacing: "0.5px" }}>
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
                    style={{ position: "absolute", right: "14px", top: "38px", background: "none", border: "none", color: "#8b949e", cursor: "pointer", padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <button type="submit" disabled={loading} className="cf-btn-submit">
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Sending OTP Code...
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div style={{ display: "flex", alignItems: "center", margin: "22px 0 16px 0" }}>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#21262d" }} />
                <span style={{ padding: "0 14px", fontSize: "11px", color: "#8b949e", fontWeight: "700", letterSpacing: "0.08em" }}>OR CONTINUE WITH</span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#21262d" }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="filled_black"
                    shape="rectangular"
                    size="large"
                    width="360"
                    text="signup_with"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGithubLogin}
                  disabled={loading}
                  className="cf-social-btn"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              <div style={{ textAlign: "center", paddingTop: "16px", borderTop: "1px solid #21262d" }}>
                <p style={{ margin: 0, fontSize: "14px", color: "#8b949e" }}>
                  Already registered?{" "}
                  <Link to="/login" style={{ color: "#a371f7", fontWeight: "bold", textDecoration: "none", transition: "color 0.2s ease" }}>
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}