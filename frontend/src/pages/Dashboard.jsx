import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Code2, Plus, Search, Folder, Users, Bot, 
  Clock, Cpu, ShieldCheck, ChevronRight, Zap, Trash2, GitFork,
  Loader2, LogOut, X, Play, BookOpen, Coffee, Terminal,
  Activity, Flame, Target, Sparkles, ArrowRight, ExternalLink,
  Layers, CheckCircle, HelpCircle, User, Edit3, Mail, Check, AlertCircle,
  Radio, RefreshCw, Database, Server
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Dynamic Animated Cosmic Background Canvas (Identical to Landing Page)
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
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.15,
      color: ["#ffffff", "#e4e4e7", "#a1a1aa", "#71717a"][Math.floor(Math.random() * 4)],
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.06 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;
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
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.5,
      }}
    />
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [roomCodeInput, setRoomCodeInput] = useState("");

  // Modals State
  const [isNewWorkspaceModalOpen, setIsNewWorkspaceModalOpen] = useState(false);
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // New Workspace State
  const [newTitle, setNewTitle] = useState("");
  const [newLang, setNewLang] = useState("python");
  const [creating, setCreating] = useState(false);

  // Edit Profile State
  const { user, logout } = useAuth() || {};
  const [editUsername, setEditUsername] = useState(user?.username || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Workspaces State
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);

  // Live Telemetry State
  const [telemetry, setTelemetry] = useState(null);
  const [telemetryLoading, setTelemetryLoading] = useState(true);
  const [telemetryLastUpdated, setTelemetryLastUpdated] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (user) {
      setEditUsername(user.username || "");
      setEditEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    fetchWorkspaces();
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchTelemetry = async () => {
    try {
      setTelemetryLoading(true);
      const res = await axios.get("http://localhost:5000/api/telemetry");
      setTelemetry(res.data);
      setTelemetryLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn("Failed to fetch telemetry metrics:", err.message);
    } finally {
      setTelemetryLoading(false);
    }
  };

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      if (!token) {
        setWorkspaces([]);
        return;
      }
      const res = await axios.get("http://localhost:5000/api/workspaces", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkspaces(res.data || []);
    } catch (err) {
      console.error("Failed to load workspaces:", err);
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (e, titleOverride = null, langOverride = null) => {
    if (e) e.preventDefault();
    const titleToUse = titleOverride || newTitle.trim();
    const langToUse = langOverride || newLang;

    if (!titleToUse) return;
    try {
      setCreating(true);
      const res = await axios.post(
        "http://localhost:5000/api/workspaces",
        { title: titleToUse, language: langToUse },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsNewWorkspaceModalOpen(false);
      setNewTitle("");
      navigate(`/workspace/${res.data._id}`);
    } catch (err) {
      console.error("Error creating workspace:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteWorkspace = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this workspace?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/workspaces/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkspaces((prev) => prev.filter((w) => w._id !== id));
    } catch (err) {
      console.error("Error deleting workspace:", err);
    }
  };

  const handleForkWorkspace = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await axios.post(
        `http://localhost:5000/api/workspaces/${id}/fork`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWorkspaces((prev) => [res.data, ...prev]);
      navigate(`/workspace/${res.data._id}`);
    } catch (err) {
      console.error("Error forking workspace:", err);
    }
  };

  // Collaboration Options
  const handleCreateRoom = () => {
    setIsCollabModalOpen(false);
    const randomRoomId = `CF-${Math.floor(1000 + Math.random() * 9000)}`;
    navigate(`/workspace?room=${randomRoomId}&mode=host`);
  };

  const handleJoinRoom = () => {
    if (roomCodeInput.trim()) {
      setIsCollabModalOpen(false);
      navigate(`/workspace?room=${encodeURIComponent(roomCodeInput.trim())}`);
    }
  };

  const handleRejoinSession = (roomCode = "CF-DEFAULT") => {
    setIsCollabModalOpen(false);
    navigate(`/workspace?room=${roomCode}`);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      setProfileMsg("");
      const res = await axios.put(
        "http://localhost:5000/api/auth/profile",
        { username: editUsername, email: editEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data) {
        localStorage.setItem("user", JSON.stringify(res.data));
        setProfileMsg("Profile updated successfully!");
        setTimeout(() => {
          setProfileMsg("");
          setIsProfileModalOpen(false);
        }, 1200);
      }
    } catch (err) {
      setProfileMsg(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleLogout = () => {
    if (logout) logout();
    else localStorage.clear();
    navigate("/?auth=login");
  };

  const getLanguageLabel = (lang) => {
    switch (lang?.toLowerCase()) {
      case "python": return "Python 3";
      case "javascript": return "JavaScript";
      case "java": return "Java 21";
      case "cpp": return "C++ 20";
      default: return lang || "Code";
    }
  };

  // Live Real-Time Search Filter
  const filteredWorkspaces = workspaces.filter(
    (w) =>
      (w.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.language || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="cd-root">
      <DynamicCosmosCanvas />

      <style>{`
        .cd-root {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          width: 100vw;
          background-color: #09090b;
          color: #ffffff;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          overflow-x: hidden;
          position: relative;
        }

        .cd-scrollable {
          overflow-y: auto;
        }
        .cd-scrollable::-webkit-scrollbar {
          width: 6px;
        }
        .cd-scrollable::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 4px;
        }

        /* Smooth Page Fade-In Transition */
        @keyframes pageFadeIn {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .cd-page-fade {
          animation: pageFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Smooth Card Pop Animations */
        @keyframes smoothPop {
          0% {
            opacity: 0;
            transform: scale(0.97) translateY(6px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .cd-animate-pop {
          animation: smoothPop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .cd-topbar {
          height: 60px;
          background-color: rgba(12, 12, 14, 0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #27272a;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          position: sticky;
          top: 0;
          z-index: 40;
          flex-shrink: 0;
        }

        .cd-logo-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background-color: #18181b;
          border: 1px solid #3f3f46;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .cd-logo-btn:hover {
          border-color: #ffffff;
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.25);
        }

        /* HIGH-CONTRAST MONOCHROMATIC BUTTONS */
        .cd-btn-bw {
          background-color: #ffffff;
          color: #09090b;
          border: none;
          border-radius: 8px;
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.15);
        }
        .cd-btn-bw:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 25px rgba(255, 255, 255, 0.35);
        }

        .cd-btn-outline {
          background-color: #121215;
          color: #ffffff;
          border: 1px solid #27272a;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .cd-btn-outline:hover {
          background-color: #18181b;
          border-color: #52525b;
        }

        /* Hero Cards */
        .cd-hero-card {
          background: #121215;
          border: 1px solid #27272a;
          border-radius: 12px;
          padding: 22px;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .cd-hero-card:hover {
          border-color: #52525b;
          background: #18181b;
          transform: translateY(-2px);
        }

        .cd-list-item {
          background-color: #121215;
          border: 1px solid #27272a;
          border-radius: 10px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.2s ease;
        }
        .cd-list-item:hover {
          border-color: #3f3f46;
          background-color: #18181b;
        }

        .cd-card {
          background: #121215;
          border: 1px solid #27272a;
          border-radius: 12px;
          padding: 24px;
        }
      `}</style>

      {/* 1. TOPBAR */}
      <header className="cd-topbar">
        <div 
          onClick={() => navigate("/")} 
          style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
        >
          <div className="cd-logo-btn">
            <Code2 size={18} color="#ffffff" />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "15px", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.02em" }}>CodeWorkspace</span>
            <span style={{ fontSize: "10px", color: "#a1a1aa", fontWeight: "500" }}>IDE PLATFORM</span>
          </div>
        </div>

        {/* Live Working Search Input */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#121215", border: "1px solid #27272a", borderRadius: "8px", padding: "8px 14px", width: "340px" }}>
          <Search size={16} color="#71717a" />
          <input 
            type="text" 
            placeholder="Search workspaces by title or language..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: "transparent", border: "none", outline: "none", color: "#ffffff", fontSize: "13px", width: "100%" }}
          />
        </div>

        {/* Topbar Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button className="cd-btn-bw" onClick={() => setIsNewWorkspaceModalOpen(true)}>
            <Plus size={15} /> New Workspace
          </button>

          <div 
            onClick={() => setIsProfileModalOpen(true)}
            style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#18181b", border: "1px solid #3f3f46", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: "#ffffff", fontWeight: "bold", cursor: "pointer" }}
            title="View / Edit Profile"
          >
            {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
          </div>

          <button 
            onClick={handleLogout}
            style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.25)", color: "#f87171", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            title="Log Out"
          >
            <LogOut size={15} color="#f87171" />
          </button>
        </div>
      </header>

      {/* 2. MAIN DASHBOARD CONTENT AREA WITH SMOOTH FADE-IN */}
      <main className="cd-scrollable cd-page-fade" style={{ flex: 1, padding: "32px 28px", zIndex: 10 }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
          
          {/* PAGE TITLE */}
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#ffffff", display: "flex", alignItems: "center", gap: "10px", letterSpacing: "-0.02em" }}>
              My Workspace Dashboard
            </h1>
            <p style={{ margin: "4px 0 0 0", fontSize: "13.5px", color: "#a1a1aa" }}>
              Welcome back, <strong style={{ color: "#ffffff" }}>{user?.username || "Developer"}</strong>! Manage cloud sandboxes, multi-language files, and pair programming rooms.
            </p>
          </div>

          {/* HERO CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px", marginBottom: "32px" }}>
            
            {/* Card 1: My Workspace */}
            <div className="cd-hero-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "11px", color: "#a1a1aa", fontWeight: "700", letterSpacing: "0.05em" }}>ACTIVE WORKSPACES</span>
                <Folder size={18} color="#ffffff" />
              </div>
              <div style={{ fontSize: "34px", fontWeight: "800", color: "#ffffff" }}>
                {workspaces.length}
              </div>
              <div style={{ fontSize: "12px", color: "#a1a1aa", marginTop: "6px", fontWeight: "500" }}>
                Cloud code sandboxes in Docker runner →
              </div>
            </div>

            {/* Card 2: Live Collaboration */}
            <div className="cd-hero-card" onClick={() => setIsCollabModalOpen(true)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "11px", color: "#a1a1aa", fontWeight: "700", letterSpacing: "0.05em" }}>LIVE COLLABORATION</span>
                <Users size={18} color="#ffffff" />
              </div>
              <div style={{ fontSize: "20px", fontWeight: "700", color: "#ffffff" }}>
                Room Options
              </div>
              <div style={{ fontSize: "12px", color: "#a1a1aa", marginTop: "12px", fontWeight: "500" }}>
                Create or join room →
              </div>
            </div>

            {/* Card 3: DSA Practice Sheets */}
            <div className="cd-hero-card" onClick={() => navigate("/sheets")}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "11px", color: "#a1a1aa", fontWeight: "700", letterSpacing: "0.05em" }}>DSA PRACTICE SHEETS</span>
                <Target size={18} color="#ffffff" />
              </div>
              <div style={{ fontSize: "20px", fontWeight: "700", color: "#ffffff" }}>
                Striver & Babbar Sheets
              </div>
              <div style={{ fontSize: "12px", color: "#a1a1aa", marginTop: "12px", fontWeight: "500" }}>
                Browse curated roadmaps & solve →
              </div>
            </div>

          </div>

          {/* CONTENT SECTION: 2 COLUMNS (WORKSPACES LEFT, COMPACT TELEMETRY SIDE CARD RIGHT) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 310px", gap: "20px", alignItems: "start" }}>
            
            {/* RECENT WORKSPACES LIST GRID (LEFT COLUMN) */}
            <div className="cd-card" style={{ margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "700", color: "#ffffff" }}>Recent Workspaces</h3>
                <span style={{ fontSize: "12px", color: "#a1a1aa", background: "#18181b", border: "1px solid #27272a", padding: "4px 10px", borderRadius: "6px", fontWeight: "600" }}>
                  {filteredWorkspaces.length} workspace(s)
                </span>
              </div>

              {loading ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#a1a1aa", fontSize: "13.5px" }}>
                  Loading workspaces...
                </div>
              ) : filteredWorkspaces.length === 0 ? (
                <div style={{ padding: "36px", border: "1px dashed #27272a", borderRadius: "12px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "#18181b", border: "1px solid #3f3f46", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Folder size={20} color="#a1a1aa" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#ffffff" }}>No Workspaces Found</h4>
                    <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "#a1a1aa" }}>
                      {searchQuery ? `No workspace matches "${searchQuery}".` : "Create your first multi-file cloud sandbox with 1-click templates below!"}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                    <button 
                      onClick={(e) => handleCreateWorkspace(e, "Python Algorithm Sandbox", "python")} 
                      className="cd-btn-bw"
                    >
                      + Python 3 Sandbox
                    </button>
                    <button 
                      onClick={(e) => handleCreateWorkspace(e, "JavaScript Web App", "javascript")} 
                      className="cd-btn-outline"
                    >
                      + JavaScript Sandbox
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {filteredWorkspaces.map((ws) => {
                    const langLabel = getLanguageLabel(ws.language);
                    const updatedDate = new Date(ws.updatedAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                    const fileCount = Array.isArray(ws.files) && ws.files.length > 0 ? ws.files.length : 1;
                    const folderCount = Array.isArray(ws.files) ? ws.files.filter(f => f.type === "folder").length : 0;

                    return (
                      <div 
                        key={ws._id}
                        className="cd-list-item"
                        onClick={() => navigate(`/workspace/${ws._id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#18181b", border: "1px solid #3f3f46", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Folder size={20} color="#ffffff" />
                          </div>
                          <div>
                            <div style={{ fontSize: "15px", fontWeight: "600", color: "#ffffff", marginBottom: "3px" }}>{ws.title}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                              <span style={{ fontSize: "12px", color: "#a1a1aa", fontWeight: "600" }}>{langLabel}</span>
                              <span style={{ fontSize: "12px", color: "#71717a" }}>• {fileCount} file(s), {folderCount} folder(s)</span>
                              <span style={{ fontSize: "12px", color: "#71717a" }}>• Updated {updatedDate}</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <button 
                            onClick={(e) => handleForkWorkspace(e, ws._id)}
                            style={{ background: "#18181b", border: "1px solid #27272a", color: "#a1a1aa", borderRadius: "8px", padding: "7px 14px", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600" }}
                            title="Fork Workspace"
                          >
                            <GitFork size={14} /> Fork
                          </button>
                          <button 
                            onClick={(e) => handleDeleteWorkspace(e, ws._id)}
                            style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#f87171", borderRadius: "8px", padding: "7px 12px", fontSize: "12px", cursor: "pointer" }}
                            title="Delete Workspace"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* COMPACT SYSTEM TELEMETRY SIDE CARD (RIGHT COLUMN) */}
            <div className="cd-card" style={{ margin: 0, padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Activity size={16} color="#10b981" />
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "#ffffff" }}>Engine Telemetry</span>
                </div>
                <span style={{ fontSize: "10px", fontWeight: "700", backgroundColor: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#34d399", padding: "2px 6px", borderRadius: "10px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#10b981" }} /> LIVE
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
                
                {/* 1. Database & Persistence */}
                <div style={{ padding: "10px 12px", backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "8px" }}>
                  <div style={{ fontSize: "10px", color: "#a1a1aa", fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>DATABASE & STORE</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ color: "#71717a" }}>MongoDB Database:</span>
                    <span style={{ color: telemetry?.database?.mongoDB === "Connected" ? "#34d399" : "#f87171", fontWeight: "700" }}>● {telemetry?.database?.mongoDB || "Connected"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#71717a" }}>Document Store:</span>
                    <span style={{ color: "#ffffff", fontWeight: "600" }}>{telemetry?.database?.documentStore || "Active"}</span>
                  </div>
                </div>

                {/* 2. Redis & Rate Limiter */}
                <div style={{ padding: "10px 12px", backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "8px" }}>
                  <div style={{ fontSize: "10px", color: "#a1a1aa", fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>QUEUE & RATE LIMITER</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ color: "#71717a" }}>Redis Connected:</span>
                    <span style={{ color: telemetry?.database?.redis === "Connected" ? "#34d399" : "#f87171", fontWeight: "700" }}>● {telemetry?.database?.redis || "Connected"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#71717a" }}>Redis Rate Limiter:</span>
                    <span style={{ color: "#ffffff", fontWeight: "600" }}>{telemetry?.database?.rateLimiter || "10 runs / min"}</span>
                  </div>
                </div>

                {/* 4. Docker Sandbox & Isolation */}
                <div style={{ padding: "10px 12px", backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "8px" }}>
                  <div style={{ fontSize: "10px", color: "#a1a1aa", fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" }}>DOCKER SANDBOX & ISOLATION</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ color: "#71717a" }}>Docker Sandbox Cap:</span>
                    <span style={{ color: "#ffffff", fontWeight: "600" }}>{telemetry?.sandbox?.dockerCap || "128MB / 0.5 CPU"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#71717a" }}>Hardened Isolation:</span>
                    <span style={{ color: "#34d399", fontWeight: "600" }}>{telemetry?.sandbox?.isolation || "Active (Isolated)"}</span>
                  </div>
                </div>

              </div>

              <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px solid #27272a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "#71717a" }}>
                  {telemetryLastUpdated ? `Updated ${telemetryLastUpdated}` : "Connecting..."}
                </span>
                <button 
                  onClick={fetchTelemetry} 
                  style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer", padding: "2px 4px", borderRadius: "4px" }}
                  title="Refresh Telemetry Metrics"
                >
                  <RefreshCw size={13} className={telemetryLoading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* 1. NEW WORKSPACE CARD MODAL */}
      {isNewWorkspaceModalOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, backgroundColor: "rgba(0, 0, 0, 0.82)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div className="cd-animate-pop" style={{ width: "100%", maxWidth: "420px", backgroundColor: "#121215", border: "1px solid #27272a", borderRadius: "16px", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "#ffffff" }}>Create Cloud Workspace</h3>
              <button onClick={() => setIsNewWorkspaceModalOpen(false)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => handleCreateWorkspace(e)}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#a1a1aa", marginBottom: "6px", fontWeight: "600" }}>Workspace Title</label>
                <input 
                  type="text"
                  placeholder="e.g. Binary Search Tree Sandbox"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "8px", padding: "10px 14px", color: "#ffffff", fontSize: "13px", outline: "none" }}
                  required
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#a1a1aa", marginBottom: "6px", fontWeight: "600" }}>Default Language</label>
                <select
                  value={newLang}
                  onChange={(e) => setNewLang(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "8px", padding: "10px 14px", color: "#ffffff", fontSize: "13px", outline: "none" }}
                >
                  <option value="python">Python 3</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java 21</option>
                  <option value="cpp">C++ 20</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setIsNewWorkspaceModalOpen(false)} className="cd-btn-outline">Cancel</button>
                <button type="submit" disabled={creating} className="cd-btn-bw">
                  {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                  <span>Create</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. COLLABORATION ROOM MODAL */}
      {isCollabModalOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, backgroundColor: "rgba(0, 0, 0, 0.82)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div className="cd-animate-pop" style={{ width: "100%", maxWidth: "440px", backgroundColor: "#121215", border: "1px solid #27272a", borderRadius: "16px", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
                <Users size={18} /> Live Pair Programming
              </h3>
              <button onClick={() => setIsCollabModalOpen(false)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ padding: "16px", backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "12px" }}>
                <h4 style={{ margin: "0 0 6px 0", fontSize: "14px", fontWeight: "700", color: "#ffffff" }}>Create New Room</h4>
                <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "#a1a1aa" }}>Generate a random room code and share it with peers for live code syncing.</p>
                <button onClick={handleCreateRoom} className="cd-btn-bw" style={{ width: "100%", justifyContent: "center" }}>
                  <Plus size={15} /> Create Host Room
                </button>
              </div>

              <div style={{ padding: "16px", backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "12px" }}>
                <h4 style={{ margin: "0 0 6px 0", fontSize: "14px", fontWeight: "700", color: "#ffffff" }}>Join Existing Room</h4>
                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  <input 
                    type="text" 
                    placeholder="Enter room code (e.g. CF-4829)"
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value)}
                    style={{ flex: 1, backgroundColor: "#121215", border: "1px solid #27272a", borderRadius: "8px", padding: "8px 12px", color: "#ffffff", fontSize: "13px", outline: "none" }}
                  />
                  <button onClick={handleJoinRoom} className="cd-btn-outline">Join</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. EDIT PROFILE MODAL */}
      {isProfileModalOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, backgroundColor: "rgba(0, 0, 0, 0.82)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div className="cd-animate-pop" style={{ width: "100%", maxWidth: "400px", backgroundColor: "#121215", border: "1px solid #27272a", borderRadius: "16px", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
                <User size={18} /> Edit User Profile
              </h3>
              <button onClick={() => setIsProfileModalOpen(false)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            {profileMsg && (
              <div style={{ padding: "10px 14px", borderRadius: "8px", fontSize: "12.5px", marginBottom: "14px", backgroundColor: profileMsg.includes("successfully") ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", border: profileMsg.includes("successfully") ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid rgba(239, 68, 68, 0.25)", color: profileMsg.includes("successfully") ? "#34d399" : "#f87171" }}>
                {profileMsg}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#a1a1aa", marginBottom: "6px", fontWeight: "600" }}>Username</label>
                <input 
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "8px", padding: "10px 14px", color: "#ffffff", fontSize: "13px", outline: "none" }}
                  required
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#a1a1aa", marginBottom: "6px", fontWeight: "600" }}>Email Address</label>
                <input 
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "8px", padding: "10px 14px", color: "#ffffff", fontSize: "13px", outline: "none" }}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setIsProfileModalOpen(false)} className="cd-btn-outline">Cancel</button>
                <button type="submit" disabled={profileSaving} className="cd-btn-bw">
                  {profileSaving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;