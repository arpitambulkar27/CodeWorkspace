import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { 
  Code2, Mail, Lock, ArrowRight, ShieldCheck, Cpu, 
  Zap, Eye, EyeOff, AlertCircle, Loader2, Sparkles, KeyRound, RefreshCw, CheckCircle2, X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LandingPage from "./LandingPage";

// Strict RFC 5322 Email Regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP Verification View State
  const [showOtpView, setShowOtpView] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSuccessMsg, setOtpSuccessMsg] = useState("");

  const { login, sendOtp, verifyOtp, loginWithGoogle } = useAuth();
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
        err.response?.data?.error || "Google sign-in failed. Token validation error."
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
    setError("Google Sign-In failed or was cancelled.");
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
      if (err.response?.data?.isUnverified) {
        setShowOtpView(true);
        setError("Please verify your email address before logging in.");
        setOtpSuccessMsg(`A 6-digit verification code was sent to ${email.trim().toLowerCase()}.`);
      } else {
        setError(
          err.response?.data?.error || "Invalid credentials. Please verify your email and password."
        );
      }
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
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-foreground flex items-center justify-center">
      {/* BACKGROUND LAYER: Blurred reflection of the Landing Page */}
      <div 
        aria-hidden="true" 
        className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0 filter blur-[10px] brightness-75 scale-105 transform-gpu opacity-75"
      >
        <LandingPage />
      </div>

      {/* OVERLAY: Dark glassmorphic backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-10" />

      {/* AUTH CARD: Translucent blur card */}
      <div className="relative z-20 w-full max-w-[460px] mx-4 my-8">
        <div className="bg-black/50 backdrop-blur-2xl border border-white/15 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/80 transition-all duration-300">
          
          {/* Header Brand & Close Button */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-display tracking-tight text-white">CODEFORGE</span>
              <span className="text-xs font-mono text-[#eca8d6] mt-0.5">IDE</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted-foreground px-3 py-1 bg-white/5 border border-white/10 rounded-full hidden sm:inline-block">
                Cloud Auth
              </span>
              <Link 
                to="/" 
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-all cursor-pointer"
                title="Close and return to landing page"
              >
                <X className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 🟢 STEP 2: UNVERIFIED USER OTP VIEW */}
          {showOtpView ? (
            <div>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#eca8d6]/10 border border-[#eca8d6]/30 flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-7 h-7 text-[#eca8d6]" />
                </div>
                <h2 className="text-2xl font-display text-white mb-2">
                  Verify Account
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Please enter the 6-digit verification code sent to <br />
                  <strong className="text-white">{email}</strong>
                </p>
              </div>

              {error && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium mb-5 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {otpSuccessMsg && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-medium mb-5 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{otpSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                    6-Digit OTP Code
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-muted-foreground text-center tracking-[6px] text-lg font-mono focus:outline-none focus:border-[#eca8d6] focus:ring-1 focus:ring-[#eca8d6] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 bg-white hover:bg-white/90 text-black font-mono text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-white/10"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying OTP...
                    </>
                  ) : (
                    <>
                      <span>Verify & Launch Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="flex justify-between items-center mt-6 pt-5 border-t border-white/10 text-xs">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="bg-transparent border-none text-[#eca8d6] font-mono font-semibold cursor-pointer flex items-center gap-1.5 hover:underline"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Resend OTP Code
                </button>

                <span 
                  onClick={() => setShowOtpView(false)} 
                  className="text-muted-foreground cursor-pointer underline hover:text-white transition-colors"
                >
                  Back to Sign In
                </span>
              </div>
            </div>
          ) : (
            /* 🔵 STEP 1: LOGIN FORM */
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-display text-white mb-2">
                  Sign in
                </h2>
                <p className="text-sm text-muted-foreground">
                  Enter your email and password to access your cloud IDE
                </p>
              </div>

              {error && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium mb-5 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="developer@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-muted-foreground text-sm focus:outline-none focus:border-[#eca8d6] focus:ring-1 focus:ring-[#eca8d6] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 pr-10 text-white placeholder:text-muted-foreground text-sm focus:outline-none focus:border-[#eca8d6] focus:ring-1 focus:ring-[#eca8d6] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 bg-white hover:bg-white/90 text-black font-mono text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-white/10"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                    </>
                  ) : (
                    <>
                      <span>Sign In to Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <span className="relative px-3 bg-black/60 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  OR CONTINUE WITH
                </span>
              </div>

              {/* OAuth Buttons (Google & GitHub) */}
              <div className="space-y-3">
                <div className="w-full flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="filled_black"
                    shape="rectangular"
                    size="large"
                    width="380"
                    text="continue_with"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGithubLogin}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-xs font-mono font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              {/* Bottom Navigation */}
              <div className="text-center pt-6 mt-6 border-t border-white/10">
                <p className="text-xs text-muted-foreground">
                  Don't have an account yet?{" "}
                  <Link to="/signup" className="text-[#eca8d6] font-semibold hover:underline transition-colors">
                    Create Account
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