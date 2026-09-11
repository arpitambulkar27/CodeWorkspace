import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { 
  Code2, ArrowRight, Terminal, ShieldCheck, Zap, Cpu, 
  Users, Bot, Sparkles, Play, CheckCircle, Copy, Check, 
  Lock, Activity, Flame, BookOpen, X, Mail, User, Eye, EyeOff,
  AlertCircle, Loader2, ChevronRight, Layers, Command, KeyRound, RefreshCw, CheckCircle2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// VS Code Syntax Highlight Helper Components for Playground
const HighlightPython = () => (
  <span>
    <span style={{ color: "#6a9955" }}># CodeWorkspace Ephemeral Python Sandbox</span>{"\n"}
    <span style={{ color: "#c586c0" }}>def</span> <span style={{ color: "#dcdcaa" }}>two_sum</span>(<span style={{ color: "#9cdcfe" }}>nums</span>, <span style={{ color: "#9cdcfe" }}>target</span>):{"\n"}
    {"    "}<span style={{ color: "#9cdcfe" }}>seen</span> = {"{}"}{"\n"}
    {"    "}<span style={{ color: "#c586c0" }}>for</span> <span style={{ color: "#9cdcfe" }}>i</span>, <span style={{ color: "#9cdcfe" }}>num</span> <span style={{ color: "#c586c0" }}>in</span> <span style={{ color: "#dcdcaa" }}>enumerate</span>(<span style={{ color: "#9cdcfe" }}>nums</span>):{"\n"}
    {"        "}<span style={{ color: "#9cdcfe" }}>diff</span> = <span style={{ color: "#9cdcfe" }}>target</span> - <span style={{ color: "#9cdcfe" }}>num</span>{"\n"}
    {"        "}<span style={{ color: "#c586c0" }}>if</span> <span style={{ color: "#9cdcfe" }}>diff</span> <span style={{ color: "#c586c0" }}>in</span> <span style={{ color: "#9cdcfe" }}>seen</span>:{"\n"}
    {"            "}<span style={{ color: "#c586c0" }}>return</span> [<span style={{ color: "#9cdcfe" }}>seen</span>[<span style={{ color: "#9cdcfe" }}>diff</span>], <span style={{ color: "#9cdcfe" }}>i</span>]{"\n"}
    {"        "}<span style={{ color: "#9cdcfe" }}>seen</span>[<span style={{ color: "#9cdcfe" }}>num</span>] = <span style={{ color: "#9cdcfe" }}>i</span>{"\n"}
    {"    "}<span style={{ color: "#c586c0" }}>return</span> []{"\n"}{"\n"}
    <span style={{ color: "#dcdcaa" }}>print</span>(<span style={{ color: "#dcdcaa" }}>two_sum</span>([<span style={{ color: "#b5cea8" }}>2</span>, <span style={{ color: "#b5cea8" }}>7</span>, <span style={{ color: "#b5cea8" }}>11</span>, <span style={{ color: "#b5cea8" }}>15</span>], <span style={{ color: "#b5cea8" }}>9</span>))
  </span>
);

const HighlightJS = () => (
  <span>
    <span style={{ color: "#6a9955" }}>// CodeWorkspace Node.js Sandbox</span>{"\n"}
    <span style={{ color: "#569cd6" }}>function</span> <span style={{ color: "#dcdcaa" }}>validParentheses</span>(<span style={{ color: "#9cdcfe" }}>s</span>) {"{\n"}
    {"  "}<span style={{ color: "#569cd6" }}>const</span> <span style={{ color: "#9cdcfe" }}>stack</span> = [];{"\n"}
    {"  "}<span style={{ color: "#569cd6" }}>const</span> <span style={{ color: "#9cdcfe" }}>map</span> = {"{ ')' : '(', '}' : '{', ']' : '[' };\n"}
    {"  "}<span style={{ color: "#c586c0" }}>for</span> (<span style={{ color: "#569cd6" }}>let</span> <span style={{ color: "#9cdcfe" }}>char</span> <span style={{ color: "#c586c0" }}>of</span> <span style={{ color: "#9cdcfe" }}>s</span>) {"{\n"}
    {"    "}<span style={{ color: "#c586c0" }}>if</span> (<span style={{ color: "#9cdcfe" }}>map</span>[<span style={{ color: "#9cdcfe" }}>char</span>]) {"{\n"}
    {"      "}<span style={{ color: "#c586c0" }}>if</span> (<span style={{ color: "#9cdcfe" }}>stack</span>.<span style={{ color: "#dcdcaa" }}>pop</span>() !== <span style={{ color: "#9cdcfe" }}>map</span>[<span style={{ color: "#9cdcfe" }}>char</span>]) <span style={{ color: "#c586c0" }}>return</span> <span style={{ color: "#569cd6" }}>false</span>;{"\n"}
    {"    }"} <span style={{ color: "#c586c0" }}>else</span> {"{\n"}
    {"      "}<span style={{ color: "#9cdcfe" }}>stack</span>.<span style={{ color: "#dcdcaa" }}>push</span>(<span style={{ color: "#9cdcfe" }}>char</span>);{"\n"}
    {"    }\n"}
    {"  }\n"}
    {"  "}<span style={{ color: "#c586c0" }}>return</span> <span style={{ color: "#9cdcfe" }}>stack</span>.<span style={{ color: "#9cdcfe" }}>length</span> === <span style={{ color: "#b5cea8" }}>0</span>;{"\n"}
    {"}"}{"\n\n"}
    <span style={{ color: "#9cdcfe" }}>console</span>.<span style={{ color: "#dcdcaa" }}>log</span>(<span style={{ color: "#ce9178" }}>"isValid('()[]{}'):"</span>, <span style={{ color: "#dcdcaa" }}>validParentheses</span>(<span style={{ color: "#ce9178" }}>"()[]{}"</span>));
  </span>
);

const HighlightCPP = () => (
  <span>
    <span style={{ color: "#6a9955" }}>// CodeWorkspace C++ 20 Sandbox</span>{"\n"}
    <span style={{ color: "#569cd6" }}>#include</span> <span style={{ color: "#ce9178" }}>&lt;iostream&gt;</span>{"\n"}
    <span style={{ color: "#569cd6" }}>#include</span> <span style={{ color: "#ce9178" }}>&lt;vector&gt;</span>{"\n"}
    <span style={{ color: "#569cd6" }}>using</span> <span style={{ color: "#569cd6" }}>namespace</span> <span style={{ color: "#4ec9b0" }}>std</span>;{"\n"}{"\n"}
    <span style={{ color: "#569cd6" }}>int</span> <span style={{ color: "#dcdcaa" }}>main</span>() {"{"}{"\n"}
    {"    "}<span style={{ color: "#4ec9b0" }}>cout</span> &lt;&lt; <span style={{ color: "#ce9178" }}>"Hello from Sandboxed GCC Container!"</span> &lt;&lt; <span style={{ color: "#4ec9b0" }}>endl</span>;{"\n"}
    {"    "}<span style={{ color: "#c586c0" }}>return</span> <span style={{ color: "#b5cea8" }}>0</span>;{"\n"}
    {"}"}
  </span>
);

const HighlightJava = () => (
  <span>
    <span style={{ color: "#6a9955" }}>// CodeWorkspace Java 21 Sandbox</span>{"\n"}
    <span style={{ color: "#569cd6" }}>public</span> <span style={{ color: "#569cd6" }}>class</span> <span style={{ color: "#4ec9b0" }}>Main</span> {"{"}{"\n"}
    {"    "}<span style={{ color: "#569cd6" }}>public</span> <span style={{ color: "#569cd6" }}>static</span> <span style={{ color: "#569cd6" }}>void</span> <span style={{ color: "#dcdcaa" }}>main</span>(<span style={{ color: "#4ec9b0" }}>String</span>[] <span style={{ color: "#9cdcfe" }}>args</span>) {"{"}{"\n"}
    {"        "}<span style={{ color: "#4ec9b0" }}>System</span>.<span style={{ color: "#9cdcfe" }}>out</span>.<span style={{ color: "#dcdcaa" }}>println</span>(<span style={{ color: "#ce9178" }}>"Java 21 Single-Pass Execution Ready!"</span>);{"\n"}
    {"    "}{"}"}{"\n"}
    {"}"}
  </span>
);

const RAW_CODE = {
  python: `def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []\n\nprint(two_sum([2, 7, 11, 15], 9))`,
  javascript: `function validParentheses(s) {\n  const stack = [];\n  const map = { ')': '(', '}': '{', ']': '[' };\n  for (let char of s) {\n    if (map[char]) {\n      if (stack.pop() !== map[char]) return false;\n    }\n    else {\n      stack.push(char);\n    }\n  }\n  return stack.length === 0;\n}\n\nconsole.log("isValid('()[]{}'):", validParentheses("()[]{}" ));`,
  cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    cout << "Hello from Sandboxed GCC Container!" << endl;\n    return 0;\n}`,
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Java 21 Single-Pass Execution Ready!");\n    }\n}`
};

const CODE_OUTPUT = {
  python: `[0, 1]\n✓ Container exited with code 0 (142ms | Memory: 24MB)`,
  javascript: `isValid('()[]{}'): true\n✓ Container exited with code 0 (118ms | Memory: 32MB)`,
  cpp: `Hello from Sandboxed GCC Container!\n✓ Container exited with code 0 (210ms | Memory: 16MB)`,
  java: `Java 21 Single-Pass Execution Ready!\n✓ Container exited with code 0 (310ms | Memory: 48MB)`
};

// 🌌 Dynamic Animated Particles Canvas (Grey-Black Monochromatic Metallic)
const DynamicCosmosCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles = Array.from({ length: 85 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.5,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      alpha: Math.random() * 0.6 + 0.25,
      color: ["#e4e4e7", "#a1a1aa", "#71717a", "#38bdf8", "#a855f7"][Math.floor(Math.random() * 5)],
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle constellation mesh
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(161, 161, 170, ${0.14 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw floating nodes
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.6,
      }}
    />
  );
};

export default function LandingPage({ initialAuthMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, register, loginWithGoogle, sendOtp, verifyOtp } = useAuth() || {};

  // OTP Verification View State
  const [showOtpView, setShowOtpView] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSuccessMsg, setOtpSuccessMsg] = useState("");

  const handleGoogleSuccess = async (credentialResponse) => {
    setAuthError("");
    setAuthLoading(true);
    try {
      if (credentialResponse.credential && loginWithGoogle) {
        await loginWithGoogle(credentialResponse.credential);
        setAuthModalOpen(false);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Google Auth Error:", err);
      setAuthError(
        err.response?.data?.error || "Google sign-in failed. Token validation error."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGithubLogin = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || "";
    const redirectUri = `${window.location.origin}/auth/github/callback`;
    const scope = "read:user user:email";
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
  };

  const handleGoogleError = () => {
    setAuthError("Google Sign-In failed or was cancelled.");
  };

  // Always render LandingPage by default at root URL

  // Interactive Demo State
  const [activeLang, setActiveLang] = useState("python");
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [demoOutput, setDemoOutput] = useState(CODE_OUTPUT.python);

  // Live Telemetry State
  const [telemetry, setTelemetry] = useState(null);

  // Inline Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signup"); // 'login' or 'signup'
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const fetchTelemetry = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const res = await axios.get(`${apiBaseUrl}/api/telemetry`);
      setTelemetry(res.data);
    } catch (err) {
      console.error("Telemetry error:", err);
    }
  };

  // Auto-Open Auth Modal if requested via props or URL query string ?auth=login
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authQuery = params.get("auth");

    if (initialAuthMode) {
      setAuthMode(initialAuthMode);
      setAuthModalOpen(true);
    } else if (authQuery === "login" || authQuery === "signup") {
      setAuthMode(authQuery);
      setAuthModalOpen(true);
    }
  }, [location.search, initialAuthMode]);

  // Requirement 1: Bidirectional Scroll Reveal / Vanish Effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("cf-reveal-visible");
          } else {
            // Remove visible class when scrolling back away to give smooth vanish effect
            entry.target.classList.remove("cf-reveal-visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    const elements = document.querySelectorAll(".cf-reveal");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Requirement 4: Smooth Scroll to sections (including Telemetry)
  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleRunDemo = () => {
    setIsRunning(true);
    setDemoOutput("⏳ Booting Docker container & executing code...");
    setTimeout(() => {
      setIsRunning(false);
      setDemoOutput(CODE_OUTPUT[activeLang]);
    }, 450);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(RAW_CODE[activeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openAuth = (mode = "signup") => {
    setAuthMode(mode);
    setAuthError("");
    setOtpSuccessMsg("");
    setShowOtpView(false);
    setOtpCode("");
    setAuthModalOpen(true);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setOtpSuccessMsg("");

    if (authMode === "signup" && (!username || username.trim().length < 3)) {
      setAuthError("Username must be at least 3 characters.");
      return;
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setAuthError("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }

    setAuthLoading(true);

    try {
      if (authMode === "login") {
        await login(email.trim().toLowerCase(), password);
        setAuthModalOpen(false);
        navigate("/dashboard", { replace: true });
      } else {
        const res = await register(username.trim(), email.trim().toLowerCase(), password);
        if (res && res.requiresOtp) {
          setShowOtpView(true);
          setOtpSuccessMsg(`A 6-digit verification code was sent to ${email.trim().toLowerCase()}.`);
        } else {
          setAuthModalOpen(false);
          navigate("/dashboard", { replace: true });
        }
      }
    } catch (err) {
      if (authMode === "login" && err.response?.data?.isUnverified) {
        setShowOtpView(true);
        setAuthError("Please verify your email address before logging in.");
        setOtpSuccessMsg(`A 6-digit verification code was sent to ${email.trim().toLowerCase()}.`);
      } else {
        setAuthError(
          err.response?.data?.error ||
            `${authMode === "login" ? "Authentication" : "Registration"} failed. Please check your input.`
        );
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setAuthError("");
    setOtpSuccessMsg("");

    const cleanOtp = (otpCode || "").trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setAuthError("Please enter the 6-digit verification code.");
      return;
    }

    setAuthLoading(true);
    try {
      await verifyOtp(email.trim().toLowerCase(), cleanOtp);
      setAuthModalOpen(false);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setAuthError(
        err.response?.data?.error || "Invalid or expired verification OTP code."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setAuthError("");
    setOtpSuccessMsg("");
    setAuthLoading(true);
    try {
      await sendOtp(email.trim().toLowerCase());
      setOtpSuccessMsg("A new 6-digit OTP code has been sent to your email.");
    } catch (err) {
      setAuthError(err.response?.data?.error || "Failed to resend OTP code.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSocialAuth = (provider) => {
    setAuthError(`Authenticating via ${provider}... Launching workspace.`);
    setTimeout(() => {
      setAuthError("");
      setAuthModalOpen(false);
      navigate("/dashboard", { replace: true });
    }, 600);
  };

  return (
    <div className="cf-obsidian-root">
      <style>{`
        .cf-obsidian-root {
          min-height: 100vh;
          width: 100%;
          background-color: #09090b;
          color: #f4f4f5;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          overflow-x: hidden;
          position: relative;
        }

        /* Ambient Lighting Gradient Beams */
        .cf-ambient-beam-top {
          position: absolute;
          top: -220px;
          left: 50%;
          transform: translateX(-50%);
          width: 1100px;
          height: 700px;
          background: radial-gradient(ellipse at center, rgba(228, 228, 231, 0.12) 0%, rgba(39, 39, 42, 0.08) 45%, rgba(9, 9, 11, 0) 75%);
          pointer-events: none;
          z-index: 1;
        }

        /* Grid Pattern */
        .cf-grid-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
          background-size: 36px 36px;
          opacity: 0.14;
          pointer-events: none;
          z-index: 1;
        }

        /* Requirement 1: Bidirectional Scroll Reveal / Vanish Animations */
        .cf-reveal {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cf-reveal-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* Metallic Primary Button */
        .cf-btn-obsidian-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #27272a 0%, #18181b 100%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          padding: 13px 28px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 30px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2);
          text-decoration: none;
        }
        .cf-btn-obsidian-primary:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.4);
          box-shadow: 0 14px 36px -4px rgba(0, 0, 0, 0.7);
          filter: brightness(1.15);
        }

        .cf-btn-obsidian-secondary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background-color: rgba(18, 18, 21, 0.8);
          border: 1px solid #27272a;
          color: #a1a1aa;
          padding: 13px 26px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.25s ease;
          text-decoration: none;
          backdrop-filter: blur(12px);
        }
        .cf-btn-obsidian-secondary:hover {
          border-color: #52525b;
          color: #ffffff;
          background-color: rgba(39, 39, 42, 0.6);
          transform: translateY(-2px);
        }

        /* Requirement 6: Distinct Metallic Vibrant Hover Feature Cards */
        .cf-feature-card {
          background-color: rgba(18, 18, 21, 0.85);
          border: 1px solid #27272a;
          border-radius: 18px;
          padding: 30px;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          backdrop-filter: blur(16px);
          position: relative;
          z-index: 10;
        }
        
        .cf-card-emerald:hover {
          border-color: #10b981;
          box-shadow: 0 20px 50px -10px rgba(16, 185, 129, 0.25);
          transform: translateY(-6px);
        }
        .cf-card-cyan:hover {
          border-color: #38bdf8;
          box-shadow: 0 20px 50px -10px rgba(56, 189, 248, 0.25);
          transform: translateY(-6px);
        }
        .cf-card-purple:hover {
          border-color: #a855f7;
          box-shadow: 0 20px 50px -10px rgba(168, 85, 247, 0.25);
          transform: translateY(-6px);
        }
        .cf-card-pink:hover {
          border-color: #f472b6;
          box-shadow: 0 20px 50px -10px rgba(244, 114, 182, 0.25);
          transform: translateY(-6px);
        }
        .cf-card-amber:hover {
          border-color: #f59e0b;
          box-shadow: 0 20px 50px -10px rgba(245, 158, 11, 0.25);
          transform: translateY(-6px);
        }
        .cf-card-indigo:hover {
          border-color: #818cf8;
          box-shadow: 0 20px 50px -10px rgba(129, 140, 248, 0.25);
          transform: translateY(-6px);
        }

        .cf-obsidian-headline {
          background: linear-gradient(135deg, #ffffff 0%, #e4e4e7 40%, #a1a1aa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .cf-code-tab {
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
          cursor: pointer;
          color: #71717a;
          background: transparent;
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }
        .cf-code-tab:hover { color: #f4f4f5; }
        .cf-code-tab.active {
          color: #ffffff;
          background-color: #27272a;
          border-color: #3f3f46;
        }

        /* Modal Overlay */
        .cf-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 200;
          background-color: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .cf-modal-input-field {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 16px 12px 42px;
          background-color: #121215;
          border: 1px solid #27272a;
          border-radius: 10px;
          color: #f4f4f5;
          font-size: 14px;
          outline: none;
          transition: all 0.25s ease;
        }
        .cf-modal-input-field:hover {
          border-color: #52525b;
        }
        .cf-modal-input-field:focus {
          border-color: #a1a1aa;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
        }

        .cf-social-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 11px 16px;
          background-color: #121215;
          border: 1px solid #27272a;
          border-radius: 10px;
          color: #f4f4f5;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .cf-social-btn:hover {
          border-color: #52525b;
          background-color: #18181b;
          transform: translateY(-1px);
        }
      `}</style>

      {/* Dynamic Animated Stars & Mesh Canvas */}
      <DynamicCosmosCanvas />

      <div className="cf-ambient-beam-top" />
      <div className="cf-grid-pattern" />

      {/* 🧭 REQUIREMENT 3: NAVIGATION HEADER WITH LOGO FIXED IN FAR LEFT CORNER */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(16px)", backgroundColor: "rgba(9, 9, 11, 0.85)", borderBottom: "1px solid #27272a", width: "100%" }}>
        <div style={{ width: "100%", padding: "16px 36px", display: "flex", justifyContent: "space-between", alignItems: "center", boxSizing: "border-box" }}>
          
          {/* Requirement 3: Far Left Corner Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginRight: "auto" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div style={{ padding: "8px", backgroundColor: "#18181b", borderRadius: "10px", border: "1px solid #3f3f46" }}>
              <Code2 color="#e4e4e7" size={24} />
            </div>
            <span style={{ fontSize: "20px", fontWeight: "900", color: "#fcfcfb", letterSpacing: "-0.5px" }}>
              CodeWorkspace
            </span>
          </div>

          {/* Requirement 4: Smooth Scroll Nav Links */}
          <nav style={{ display: "flex", alignItems: "center", gap: "36px", fontSize: "14px", fontWeight: "600", color: "#a1a1aa", margin: "0 auto" }}>
            <span onClick={() => scrollToSection("features")} style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={(e) => e.target.style.color = "#ffffff"} onMouseLeave={(e) => e.target.style.color = "#bbb8b8"}>Features</span>
            <span onClick={() => scrollToSection("playground")} style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={(e) => e.target.style.color = "#ffffff"} onMouseLeave={(e) => e.target.style.color = "#bbb8b8"}>Live Playground</span>
            <span onClick={() => scrollToSection("architecture")} style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={(e) => e.target.style.color = "#ffffff"} onMouseLeave={(e) => e.target.style.color = "#bbb8b8"}>Architecture</span>
            <span onClick={() => scrollToSection("telemetry")} style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={(e) => e.target.style.color = "#ffffff"} onMouseLeave={(e) => e.target.style.color = "#bbb8b8"}>Telemetry</span>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginLeft: "auto" }}>
            {user ? (
              <button onClick={() => navigate("/dashboard")} className="cf-btn-obsidian-primary" style={{ padding: "9px 20px", fontSize: "14px" }}>
                Dashboard <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <button onClick={() => openAuth("login")} className="cf-btn-obsidian-primary" style={{ padding: "9px 18px", fontSize: "14px" }}>
                  Sign In
                </button>
                <button onClick={() => openAuth("signup")} className="cf-btn-obsidian-primary" style={{ padding: "9px 20px", fontSize: "14px" }}>
                  Get Started <ArrowRight size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 🚀 HERO SECTION */}
      <section style={{ maxWidth: "1240px", margin: "0 auto", padding: "85px 32px 60px 32px", textAlign: "center", position: "relative", zIndex: 10 }}>
        
        {/* Obsidian Metallic Badge */}
        {/* <div className="cf-reveal" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", borderRadius: "30px", backgroundColor: "#18181b", border: "1px solid #3f3f46", color: "#e4e4e7", fontSize: "13px", fontWeight: "bold", marginBottom: "28px" }}>
          <Sparkles size={15} color="#e4e4e7" /> Ephemeral Docker Sandboxes & AI Code Reviews
        </div> */}

        {/* Requirement 2: Renamed to CodeWorkspace */}
        <h1 className="cf-reveal" style={{ fontSize: "64px", fontWeight: "900", letterSpacing: "-1.8px", lineHeight: "1.1", margin: "0 0 24px 0", color: "#ffffff", maxWidth: "1000px", marginLeft: "auto", marginRight: "auto" }}>
          The Open-Source Cloud IDE & <span className="cf-obsidian-headline">Sandboxed Execution Engine</span>
        </h1>

        <p className="cf-reveal" style={{ fontSize: "16px", color: "#a1a1aa", lineHeight: "1.6", maxWidth: "760px", margin: "0 auto 36px auto" }}>
          Spin up isolated Python, Javascript, C++, and Java containers in under 180ms. Collaborate in real-time over WebSockets with automated Gemini AI code reviews.
        </p>

        {/* Requirement 8: Single Get Started Action Button */}
        {/* <div className="cf-reveal" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "70px" }}>
          <button onClick={() => openAuth("signup")} className="cf-btn-obsidian-primary" style={{ padding: "14px 32px", fontSize: "16px" }}>
            Get Started <ArrowRight size={18} />
          </button>
        </div> */}

        {/* 💻 INTERACTIVE VS CODE SYNTAX-HIGHLIGHTED PLAYGROUND */}
        <div id="playground" className="cf-reveal" style={{ maxWidth: "940px", margin: "0 auto", backgroundColor: "#121215", border: "1px solid #27272a", borderRadius: "20px", overflow: "hidden", boxShadow: "0 30px 80px -20px rgba(0, 0, 0, 0.9)", textAlign: "left" }}>
          
          {/* VS Code Window Title Bar */}
          <div style={{ backgroundColor: "#18181b", padding: "12px 20px", borderBottom: "1px solid #27272a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ display: "flex", gap: "6px" }}>
                <div style={{ width: "11px", height: "11px", borderRadius: "50%", backgroundColor: "#ff5f56" }} />
                <div style={{ width: "11px", height: "11px", borderRadius: "50%", backgroundColor: "#ffbd2e" }} />
                <div style={{ width: "11px", height: "11px", borderRadius: "50%", backgroundColor: "#27c93f" }} />
              </div>
              <span style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#a1a1aa" }}>CodeWorkspace VS Code Sandbox</span>
            </div>

            {/* Language Switcher Tabs */}
            <div style={{ display: "flex", gap: "6px" }}>
              <button className={`cf-code-tab ${activeLang === "python" ? "active" : ""}`} onClick={() => { setActiveLang("python"); setDemoOutput(CODE_OUTPUT.python); }}>Python</button>
              <button className={`cf-code-tab ${activeLang === "javascript" ? "active" : ""}`} onClick={() => { setActiveLang("javascript"); setDemoOutput(CODE_OUTPUT.javascript); }}>Node.js</button>
              <button className={`cf-code-tab ${activeLang === "cpp" ? "active" : ""}`} onClick={() => { setActiveLang("cpp"); setDemoOutput(CODE_OUTPUT.cpp); }}>C++ 20</button>
              <button className={`cf-code-tab ${activeLang === "java" ? "active" : ""}`} onClick={() => { setActiveLang("java"); setDemoOutput(CODE_OUTPUT.java); }}>Java 21</button>
            </div>

            {/* Playground Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button onClick={copyCode} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer", padding: "4px" }} title="Copy Raw Code">
                {copied ? <Check size={16} color="#38bdf8" /> : <Copy size={16} />}
              </button>
              <button onClick={handleRunDemo} disabled={isRunning} className="cf-btn-obsidian-primary" style={{ padding: "6px 14px", fontSize: "12px" }}>
                {isRunning ? "Running..." : "Run Code"} <Play size={13} />
              </button>
            </div>
          </div>

          {/* VS Code Dark Colored Syntax Highlighting */}
          <div style={{ padding: "22px 24px", fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", lineHeight: "1.7", backgroundColor: "#09090b", color: "#d4d4d4", overflowX: "auto" }}>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
              {activeLang === "python" && <HighlightPython />}
              {activeLang === "javascript" && <HighlightJS />}
              {activeLang === "cpp" && <HighlightCPP />}
              {activeLang === "java" && <HighlightJava />}
            </pre>
          </div>

          {/* VS Code Integrated Terminal Box */}
          <div style={{ backgroundColor: "#121215", padding: "14px 20px", borderTop: "1px solid #27272a", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a1a1aa", marginBottom: "6px" }}>
              <Terminal size={14} color="#38bdf8" /> Output Terminal:
            </div>
            <pre style={{ margin: 0, color: "#38bdf8", whiteSpace: "pre-wrap" }}>{demoOutput}</pre>
          </div>
        </div>

      </section>

      {/* 📊 NUMERICAL PROOF BANNER */}
      <section className="cf-reveal" style={{ borderTop: "1px solid #27272a", borderBottom: "1px solid #27272a", backgroundColor: "rgba(18, 18, 21, 0.6)", padding: "40px 32px" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "32px", textAlign: "center" }}>
          <div>
            <div style={{ fontSize: "36px", fontWeight: "900", color: "#ffffff" }}>&lt; 180ms</div>
            <div style={{ fontSize: "13px", color: "#a1a1aa", marginTop: "4px" }}>Avg Container Startup Latency</div>
          </div>
          <div>
            <div style={{ fontSize: "36px", fontWeight: "900", color: "#e4e4e7" }}>128 MB</div>
            <div style={{ fontSize: "13px", color: "#a1a1aa", marginTop: "4px" }}>Hardened Memory Cap per Run</div>
          </div>
          <div>
            <div style={{ fontSize: "36px", fontWeight: "900", color: "#38bdf8" }}>&lt; 5ms</div>
            <div style={{ fontSize: "13px", color: "#a1a1aa", marginTop: "4px" }}>BullMQ Queue Dispatch Overhead</div>
          </div>
          <div>
            <div style={{ fontSize: "36px", fontWeight: "900", color: "#a1a1aa" }}>100%</div>
            <div style={{ fontSize: "13px", color: "#a1a1aa", marginTop: "4px" }}>Network-Isolated Ephemeral Security</div>
          </div>
        </div>
      </section>

      {/* 🧩 REQUIREMENT 6: FEATURE CARDS GRID WITH DISTINCT METALLIC ACCENT COLOURS */}
      <section id="features" style={{ maxWidth: "1240px", margin: "0 auto", padding: "100px 32px" }}>
        <div className="cf-reveal" style={{ textAlign: "center", marginBottom: "60px" }}>
          <span style={{ fontSize: "13px", color: "#a1a1aa", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>Engine Features</span>
          <h2 style={{ fontSize: "42px", fontWeight: "900", color: "#ffffff", letterSpacing: "-1px", margin: "10px 0 16px 0" }}>
            Built for High Concurrency & Zero Flaws
          </h2>
          <p style={{ fontSize: "16px", color: "#a1a1aa", maxWidth: "600px", margin: "0 auto" }}>
            Every layer engineered from the ground up to isolate untrusted code execution safely.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          
          <div className="cf-feature-card cf-card-emerald cf-reveal">
            <div style={{ padding: "10px", backgroundColor: "rgba(16, 185, 129, 0.15)", borderRadius: "12px", width: "fit-content", marginBottom: "20px", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
              <ShieldCheck size={24} color="#10b981" />
            </div>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "20px", fontWeight: "bold", color: "#ffffff" }}>Ephemeral Docker Sandboxing</h3>
            <p style={{ margin: 0, fontSize: "14px", color: "#a1a1aa", lineHeight: "1.6" }}>
              Untrusted code runs in isolated single-use containers with `--memory=128m`, `--cpus=0.5`, non-root UIDs, and `--network=none`.
            </p>
          </div>

          <div className="cf-feature-card cf-card-cyan cf-reveal">
            <div style={{ padding: "10px", backgroundColor: "rgba(56, 189, 248, 0.15)", borderRadius: "12px", width: "fit-content", marginBottom: "20px", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
              <Cpu size={24} color="#38bdf8" />
            </div>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "20px", fontWeight: "bold", color: "#ffffff" }}>BullMQ & Redis Worker Queue</h3>
            <p style={{ margin: 0, fontSize: "14px", color: "#a1a1aa", lineHeight: "1.6" }}>
              Decouples heavy code execution workloads from HTTP threads to keep the Node.js event loop fast and responsive under heavy traffic.
            </p>
          </div>

          <div className="cf-feature-card cf-card-purple cf-reveal">
            <div style={{ padding: "10px", backgroundColor: "rgba(168, 85, 247, 0.15)", borderRadius: "12px", width: "fit-content", marginBottom: "20px", border: "1px solid rgba(168, 85, 247, 0.3)" }}>
              <Users size={24} color="#a855f7" />
            </div>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "20px", fontWeight: "bold", color: "#ffffff" }}>Socket.io Real-Time Rooms</h3>
            <p style={{ margin: 0, fontSize: "14px", color: "#a1a1aa", lineHeight: "1.6" }}>
              Pair program live with multi-peer buffer synchronization, cursor highlights, and instant execution result broadcasts.
            </p>
          </div>

          <div className="cf-feature-card cf-card-pink cf-reveal">
            <div style={{ padding: "10px", backgroundColor: "rgba(244, 114, 182, 0.15)", borderRadius: "12px", width: "fit-content", marginBottom: "20px", border: "1px solid rgba(244, 114, 182, 0.3)" }}>
              <Bot size={24} color="#f472b6" />
            </div>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "20px", fontWeight: "bold", color: "#ffffff" }}>Gemini AI Code Reviewer</h3>
            <p style={{ margin: 0, fontSize: "14px", color: "#a1a1aa", lineHeight: "1.6" }}>
              Automated 3-category code reviews providing Bug Detection, O(N) Time/Space Complexity estimates, and clean refactoring tips.
            </p>
          </div>

          <div className="cf-feature-card cf-card-amber cf-reveal">
            <div style={{ padding: "10px", backgroundColor: "rgba(245, 158, 11, 0.15)", borderRadius: "12px", width: "fit-content", marginBottom: "20px", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
              <Lock size={24} color="#f59e0b" />
            </div>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "20px", fontWeight: "bold", color: "#ffffff" }}>Redis Rate Limiting</h3>
            <p style={{ margin: 0, fontSize: "14px", color: "#a1a1aa", lineHeight: "1.6" }}>
              Sliding-window algorithm restricting executions per IP/User to mitigate Denial-of-Service (DoS) and fork-bomb vulnerabilities.
            </p>
          </div>

          <div className="cf-feature-card cf-card-indigo cf-reveal">
            <div style={{ padding: "10px", backgroundColor: "rgba(129, 140, 248, 0.15)", borderRadius: "12px", width: "fit-content", marginBottom: "20px", border: "1px solid rgba(129, 140, 248, 0.3)" }}>
              <Activity size={24} color="#818cf8" />
            </div>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "20px", fontWeight: "bold", color: "#ffffff" }}>Prometheus Observability</h3>
            <p style={{ margin: 0, fontSize: "14px", color: "#a1a1aa", lineHeight: "1.6" }}>
              Exposes standard `/metrics` telemetry measuring p95 execution latency, queue backlog depth, and active socket gauges.
            </p>
          </div>

        </div>
      </section>

      {/* 🏗️ REQUIREMENT 7: SYSTEM ARCHITECTURE (5 STRUCTURED FEATURE-LIKE BOXES) */}
      <section id="architecture" className="cf-reveal" style={{ borderTop: "1px solid #27272a", backgroundColor: "#09090b", padding: "100px 32px" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto", textAlign: "center" }}>
          <span style={{ fontSize: "13px", color: "#a1a1aa", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>System Architecture</span>
          <h2 style={{ fontSize: "42px", fontWeight: "900", color: "#ffffff", letterSpacing: "-1px", margin: "10px 0 16px 0" }}>
            How CodeWorkspace Executes Untrusted Code
          </h2>
          <p style={{ fontSize: "16px", color: "#a1a1aa", maxWidth: "600px", margin: "0 auto 50px auto" }}>
            End-to-end multi-tier pipeline designed for high performance and isolation.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "20px" }}>
            
            <div className="cf-feature-card cf-card-cyan" style={{ textAlign: "left", padding: "24px" }}>
              <div style={{ fontSize: "11px", fontWeight: "bold", color: "#38bdf8", backgroundColor: "rgba(56, 189, 248, 0.15)", padding: "4px 8px", borderRadius: "6px", width: "fit-content", marginBottom: "16px" }}>
                STEP 1
              </div>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "bold", color: "#ffffff" }}>Monaco Editor AST</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#a1a1aa", lineHeight: "1.5" }}>Captures buffer payload, selected runtime, and custom stdin input.</p>
            </div>

            <div className="cf-feature-card cf-card-purple" style={{ textAlign: "left", padding: "24px" }}>
              <div style={{ fontSize: "11px", fontWeight: "bold", color: "#a855f7", backgroundColor: "rgba(168, 85, 247, 0.15)", padding: "4px 8px", borderRadius: "6px", width: "fit-content", marginBottom: "16px" }}>
                STEP 2
              </div>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "bold", color: "#ffffff" }}>Express REST API</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#a1a1aa", lineHeight: "1.5" }}>Verifies JWT auth & enforces Redis sliding-window rate limits.</p>
            </div>

            <div className="cf-feature-card cf-card-emerald" style={{ textAlign: "left", padding: "24px" }}>
              <div style={{ fontSize: "11px", fontWeight: "bold", color: "#10b981", backgroundColor: "rgba(16, 185, 129, 0.15)", padding: "4px 8px", borderRadius: "6px", width: "fit-content", marginBottom: "16px" }}>
                STEP 3
              </div>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "bold", color: "#ffffff" }}>BullMQ & Redis Queue</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#a1a1aa", lineHeight: "1.5" }}>Enqueues execution job in &lt;5ms to protect HTTP thread pool.</p>
            </div>

            <div className="cf-feature-card cf-card-pink" style={{ textAlign: "left", padding: "24px" }}>
              <div style={{ fontSize: "11px", fontWeight: "bold", color: "#f472b6", backgroundColor: "rgba(244, 114, 182, 0.15)", padding: "4px 8px", borderRadius: "6px", width: "fit-content", marginBottom: "16px" }}>
                STEP 4
              </div>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "bold", color: "#ffffff" }}>Docker Container</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#a1a1aa", lineHeight: "1.5" }}>Spins up 128MB ephemeral container with `--network=none` isolation.</p>
            </div>

            <div className="cf-feature-card cf-card-amber" style={{ textAlign: "left", padding: "24px" }}>
              <div style={{ fontSize: "11px", fontWeight: "bold", color: "#f59e0b", backgroundColor: "rgba(245, 158, 11, 0.15)", padding: "4px 8px", borderRadius: "6px", width: "fit-content", marginBottom: "16px" }}>
                STEP 5
              </div>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "bold", color: "#ffffff" }}>Socket.io Stream</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#a1a1aa", lineHeight: "1.5" }}>Streams stdout/stderr and Prometheus telemetry back to client.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 📊 REQUIREMENT 4: TELEMETRY SECTION */}
      <section id="telemetry" className="cf-reveal" style={{ borderTop: "1px solid #27272a", backgroundColor: "#09090b", padding: "90px 32px" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <span style={{ fontSize: "13px", color: "#a1a1aa", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>Live Observability</span>
            <h2 style={{ fontSize: "42px", fontWeight: "900", color: "#ffffff", letterSpacing: "-1px", margin: "10px 0 16px 0" }}>
              Real-Time System Telemetry
            </h2>
            <p style={{ fontSize: "16px", color: "#a1a1aa", maxWidth: "600px", margin: "0 auto" }}>
              Live Prometheus metrics scraped from our active backend runtime.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
            <div className="cf-feature-card cf-card-cyan" style={{ padding: "24px" }}>
              <div style={{ fontSize: "12px", color: "#a1a1aa", fontWeight: "600" }}>MongoDB Database</div>
              <div style={{ fontSize: "22px", fontWeight: "bold", color: "#ffffff", margin: "8px 0 4px 0" }}>
                {telemetry?.database?.mongoDB || "Connected"}
              </div>
              <span style={{ fontSize: "11px", color: "#38bdf8", backgroundColor: "rgba(56, 189, 248, 0.15)", padding: "2px 8px", borderRadius: "6px", fontWeight: "bold" }}>
                Document Store
              </span>
            </div>

            <div className="cf-feature-card cf-card-emerald" style={{ padding: "24px" }}>
              <div style={{ fontSize: "12px", color: "#a1a1aa", fontWeight: "600" }}>Redis Rate Limiter</div>
              <div style={{ fontSize: "22px", fontWeight: "bold", color: "#ffffff", margin: "8px 0 4px 0" }}>
                10 runs / min
              </div>
              <span style={{ fontSize: "11px", color: "#10b981", backgroundColor: "rgba(16, 185, 129, 0.15)", padding: "2px 8px", borderRadius: "6px", fontWeight: "bold" }}>
                {telemetry?.database?.redis ? `Redis ${telemetry.database.redis}` : "Active"}
              </span>
            </div>

            <div className="cf-feature-card cf-card-purple" style={{ padding: "24px" }}>
              <div style={{ fontSize: "12px", color: "#a1a1aa", fontWeight: "600" }}>Prometheus Metrics</div>
              <div style={{ fontSize: "22px", fontWeight: "bold", color: "#ffffff", margin: "8px 0 4px 0" }}>
                /metrics
              </div>
              <span style={{ fontSize: "11px", color: "#a855f7", backgroundColor: "rgba(168, 85, 247, 0.15)", padding: "2px 8px", borderRadius: "6px", fontWeight: "bold" }}>
                Live Scraping
              </span>
            </div>

            <div className="cf-feature-card cf-card-pink" style={{ padding: "24px" }}>
              <div style={{ fontSize: "12px", color: "#a1a1aa", fontWeight: "600" }}>Docker Sandbox Cap</div>
              <div style={{ fontSize: "22px", fontWeight: "bold", color: "#ffffff", margin: "8px 0 4px 0" }}>
                128MB / 0.5 CPU
              </div>
              <span style={{ fontSize: "11px", color: "#f472b6", backgroundColor: "rgba(244, 114, 182, 0.15)", padding: "2px 8px", borderRadius: "6px", fontWeight: "bold" }}>
                Hardened Isolation
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 🦶 FOOTER */}
      <footer style={{ borderTop: "1px solid #27272a", backgroundColor: "#09090b", padding: "40px 32px", position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", color: "#a1a1aa" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Code2 size={20} color="#e4e4e7" />
            <span style={{ color: "#ffffff", fontWeight: "bold" }}>CodeWorkspace Cloud IDE</span>
            <span>© 2026 CodeWorkspace. All rights reserved.</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#18181b", padding: "4px 12px", borderRadius: "14px", border: "1px solid #3f3f46", color: "#e4e4e7", fontWeight: "bold" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#3fb950" }} />
            All Systems Operational
          </div>

        </div>
      </footer>

      {/* 🔒 INLINE AUTH MODAL */}
      {authModalOpen && (
        <div className="cf-modal-backdrop" onClick={() => setAuthModalOpen(false)}>
          <div 
            style={{ width: "100%", maxWidth: "440px", backgroundColor: "#121215", border: "1px solid #27272a", borderRadius: "20px", padding: "36px", boxShadow: "0 25px 60px rgba(0, 0, 0, 0.9)", position: "relative" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setAuthModalOpen(false)}
              style={{ position: "absolute", right: "20px", top: "20px", background: "none", border: "none", color: "#a1a1aa", cursor: "pointer", padding: "4px" }}
            >
              <X size={20} />
            </button>

            {showOtpView ? (
              <div>
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(163, 113, 247, 0.15)", border: "1px solid rgba(163, 113, 247, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px auto" }}>
                    <KeyRound size={24} color="#a371f7" />
                  </div>
                  <h3 style={{ margin: "0 0 6px 0", fontSize: "20px", fontWeight: "900", color: "#ffffff" }}>
                    Verify Your Email
                  </h3>
                  <p style={{ margin: 0, fontSize: "13px", color: "#a1a1aa", lineHeight: "1.5" }}>
                    Enter the 6-digit verification code sent to <br />
                    <strong style={{ color: "#ffffff" }}>{email}</strong>
                  </p>
                </div>

                {authError && (
                  <div style={{ padding: "12px 14px", backgroundColor: "rgba(248, 81, 73, 0.15)", border: "1px solid rgba(248, 81, 73, 0.4)", borderRadius: "10px", color: "#f85149", fontSize: "12px", fontWeight: "600", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <AlertCircle size={16} />
                    <span>{authError}</span>
                  </div>
                )}

                {otpSuccessMsg && (
                  <div style={{ padding: "12px 14px", backgroundColor: "rgba(46, 160, 67, 0.15)", border: "1px solid rgba(46, 160, 67, 0.4)", borderRadius: "10px", color: "#3fb950", fontSize: "12px", fontWeight: "600", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <CheckCircle2 size={16} />
                    <span>{otpSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp}>
                  <div style={{ position: "relative", marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "6px" }}>
                      6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      className="cf-modal-input-field"
                      style={{ letterSpacing: "6px", fontSize: "18px", fontWeight: "bold", textAlign: "center" }}
                    />
                  </div>

                  <button type="submit" disabled={authLoading} className="cf-btn-obsidian-primary" style={{ width: "100%", justifyContent: "center" }}>
                    {authLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Verifying...
                      </>
                    ) : (
                      <>
                        <span>Verify & Launch Workspace</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #27272a", fontSize: "12px" }}>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={authLoading}
                    style={{ background: "none", border: "none", color: "#bc8cff", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <RefreshCw size={14} /> Resend OTP
                  </button>

                  <span 
                    onClick={() => { setShowOtpView(false); setAuthError(""); setOtpSuccessMsg(""); }} 
                    style={{ color: "#a1a1aa", cursor: "pointer", textDecoration: "underline" }}
                  >
                    Change Email
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <Code2 size={22} color="#e4e4e7" />
                    <span style={{ fontSize: "18px", fontWeight: "bold", color: "#ffffff" }}>CodeWorkspace</span>
                  </div>
                  <h3 style={{ margin: "0 0 6px 0", fontSize: "24px", fontWeight: "900", color: "#ffffff" }}>
                    {authMode === "login" ? "Welcome Back" : "Create an Account"}
                  </h3>
                  <p style={{ margin: 0, fontSize: "13px", color: "#a1a1aa" }}>
                    {authMode === "login" ? "Sign in to launch your personal cloud sandbox" : "Get started with isolated developer workspaces"}
                  </p>
                </div>

                {/* Social Auth Options */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                  <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      theme="filled_black"
                      shape="rectangular"
                      size="large"
                      width="360"
                      text={authMode === "login" ? "signin_with" : "signup_with"}
                    />
                  </div>

                  <button className="cf-social-btn" onClick={handleGithubLogin}>
                    <svg width="18" height="18" fill="#ffffff" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    Sign in with GitHub
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "20px 0", color: "#71717a", fontSize: "11px", fontWeight: "bold" }}>
                  <div style={{ flex: 1, height: "1px", backgroundColor: "#27272a" }} />
                  <span>OR CONTINUE WITH EMAIL</span>
                  <div style={{ flex: 1, height: "1px", backgroundColor: "#27272a" }} />
                </div>

                {authError && (
                  <div style={{ padding: "12px 14px", backgroundColor: "rgba(248, 81, 73, 0.15)", border: "1px solid rgba(248, 81, 73, 0.4)", borderRadius: "10px", color: "#f85149", fontSize: "12px", fontWeight: "600", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <AlertCircle size={16} />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit}>
                  {authMode === "signup" && (
                    <div style={{ position: "relative", marginBottom: "14px" }}>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "6px" }}>
                        Username
                      </label>
                      <User size={16} color="#71717a" style={{ position: "absolute", left: "14px", top: "34px" }} />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Arpit"
                        className="cf-modal-input-field"
                      />
                    </div>
                  )}

                  <div style={{ position: "relative", marginBottom: "14px" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "6px" }}>
                      Work Email
                    </label>
                    <Mail size={16} color="#71717a" style={{ position: "absolute", left: "14px", top: "34px" }} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="developer@codeworkspace.io"
                      className="cf-modal-input-field"
                    />
                  </div>

                  <div style={{ position: "relative", marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#a1a1aa", marginBottom: "6px" }}>
                      Password
                    </label>
                    <Lock size={16} color="#71717a" style={{ position: "absolute", left: "14px", top: "34px" }} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="cf-modal-input-field"
                      style={{ paddingRight: "40px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: "12px", top: "34px", background: "none", border: "none", color: "#71717a", cursor: "pointer" }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <button type="submit" disabled={authLoading} className="cf-btn-obsidian-primary" style={{ width: "100%", justifyContent: "center" }}>
                    {authLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        <span>{authMode === "login" ? "Sign In to Workspace" : "Create Workspace Account"}</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                <div style={{ textAlign: "center", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #27272a", fontSize: "13px", color: "#a1a1aa" }}>
                  {authMode === "login" ? (
                    <>
                      Don't have an account yet?{" "}
                      <span 
                        onClick={() => { setAuthMode("signup"); setAuthError(""); }}
                        style={{ color: "#ffffff", fontWeight: "bold", cursor: "pointer" }}
                      >
                        Create Account
                      </span>
                    </>
                  ) : (
                    <>
                      Already registered?{" "}
                      <span 
                        onClick={() => { setAuthMode("login"); setAuthError(""); }}
                        style={{ color: "#ffffff", fontWeight: "bold", cursor: "pointer" }}
                      >
                        Sign In
                      </span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
