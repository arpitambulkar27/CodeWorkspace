import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Code2, Plus, Search, Home, Folder, Users, Bot, 
  Clock, Cpu, ShieldCheck, ChevronRight, 
  Zap, Sun, Moon, ArrowUpRight, Sparkles, Trash2, 
  Loader2, LogOut, X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [roomCodeInput, setRoomCodeInput] = useState("");
  
  // Workspaces State
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLang, setNewLang] = useState("python");
  const [creating, setCreating] = useState(false);

  // Auth Context
  const { user, logout } = useAuth() || {};
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchWorkspaces();
  }, []);

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

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      setCreating(true);
      const res = await axios.post(
        "http://localhost:5000/api/workspaces",
        { title: newTitle.trim(), language: newLang },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsModalOpen(false);
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

  const handleJoinRoom = () => {
    if (roomCodeInput.trim()) {
      navigate(`/workspace?room=${encodeURIComponent(roomCodeInput.trim())}`);
    }
  };

  const handleCreateRoom = () => {
    const randomRoomId = `CF-${Math.floor(1000 + Math.random() * 9000)}`;
    navigate(`/workspace?room=${randomRoomId}&mode=create`);
  };

  const handleLogout = () => {
    if (logout) logout();
    else {
      localStorage.clear();
      navigate("/login");
    }
  };

  const getLanguageDetails = (lang) => {
    switch (lang?.toLowerCase()) {
      case "python":
        return { icon: "🐍", label: "Python 3" };
      case "javascript":
        return { icon: "⚡", label: "Node.js" };
      case "java":
        return { icon: "☕", label: "Java 21" };
      case "cpp":
        return { icon: "⚙️", label: "C++ 20" };
      default:
        return { icon: "💻", label: lang || "Code" };
    }
  };

  const theme = isDarkMode ? {
    bg: "#080c14",
    panel: "#0d1117",
    border: "#1f2937",
    borderHover: "#388bfd",
    textMain: "#e6edf3",
    textMuted: "#8b949e",
    accent: "#58a6ff",
    accentGlow: "rgba(88, 166, 255, 0.15)",
    cardBg: "#0d1117",
    cardHoverBg: "#111827",
    inputBg: "#080c14",
    modalOverlay: "rgba(0, 0, 0, 0.75)",
    shadow: "0 12px 30px -10px rgba(56, 139, 253, 0.25)"
  } : {
    bg: "#f6f8fa",
    panel: "#ffffff",
    border: "#d0d7de",
    borderHover: "#0969da",
    textMain: "#1f2328",
    textMuted: "#636c76",
    accent: "#0969da",
    accentGlow: "rgba(9, 105, 218, 0.12)",
    cardBg: "#ffffff",
    cardHoverBg: "#f3f4f6",
    inputBg: "#ffffff",
    modalOverlay: "rgba(0, 0, 0, 0.4)",
    shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)"
  };

  return (
    <div className="cf-dashboard-root">
      <style>{`
        .cf-dashboard-root {
          display: flex;
          height: 100vh;
          width: 100vw;
          background-color: ${theme.bg};
          color: ${theme.textMain};
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          overflow: hidden;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        .cf-scrollable { overflow-y: auto; }
        .cf-scrollable::-webkit-scrollbar { width: 6px; }
        .cf-scrollable::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 4px; }

        .cf-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          cursor: pointer;
          color: ${theme.textMuted};
          font-weight: 500;
          font-size: 14px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid transparent;
        }
        .cf-nav-item:hover {
          background-color: ${theme.accentGlow};
          color: ${theme.textMain};
          transform: translateX(4px);
        }
        .cf-nav-item.active {
          background-color: ${theme.accentGlow};
          color: ${theme.accent};
          border-color: ${theme.borderHover};
          font-weight: 600;
        }

        .cf-card {
          background-color: ${theme.cardBg};
          border: 1px solid ${theme.border};
          padding: 22px;
          border-radius: 12px;
          cursor: pointer;
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cf-card:hover {
          transform: translateY(-6px);
          border-color: ${theme.borderHover};
          box-shadow: ${theme.shadow};
          background-color: ${theme.cardHoverBg};
        }

        .cf-card-delete {
          opacity: 0;
          transition: opacity 0.2s ease, color 0.2s ease;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
        }
        .cf-card:hover .cf-card-delete { opacity: 1; }
        .cf-card-delete:hover {
          color: #f85149 !important;
          background-color: rgba(248, 81, 73, 0.1);
        }

        .cf-btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #238636 0%, #2ea043 100%);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.25s ease;
          box-shadow: 0 4px 12px rgba(35, 134, 54, 0.3);
        }
        .cf-btn-primary:hover {
          transform: scale(1.03);
          box-shadow: 0 6px 20px rgba(35, 134, 54, 0.5);
        }

        .cf-btn-secondary {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: ${theme.panel};
          border: 1px solid ${theme.border};
          color: ${theme.textMain};
          padding: 10px 18px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.25s ease;
        }
        .cf-btn-secondary:hover {
          border-color: ${theme.accent};
          transform: translateY(-2px);
        }

        .cf-search-input {
          width: 100%;
          padding: 10px 14px 10px 42px;
          background-color: ${theme.panel};
          border: 1px solid ${theme.border};
          border-radius: 8px;
          color: ${theme.textMain};
          outline: none;
          transition: all 0.25s ease;
        }
        .cf-search-input:focus {
          border-color: ${theme.accent};
          box-shadow: 0 0 0 3px ${theme.accentGlow};
        }

        .cf-theme-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid ${theme.border};
          background-color: ${theme.panel};
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 15px;
        }
        .cf-theme-toggle:hover { border-color: ${theme.accent}; }

        .cf-pulse-dot {
          width: 8px;
          height: 8px;
          background-color: #3fb950;
          border-radius: 50%;
          position: relative;
        }
        .cf-pulse-dot::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: #3fb950;
          animation: pulse 1.8s infinite ease-in-out;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.8); opacity: 0; }
        }
      `}</style>

      {/* 📱 SIDEBAR NAVIGATION */}
      <aside style={{ width: "260px", backgroundColor: theme.panel, borderRight: `1px solid ${theme.border}`, padding: "24px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "36px" }}>
          <div style={{ padding: "8px", backgroundColor: theme.accentGlow, borderRadius: "10px", border: `1px solid ${theme.accent}` }}>
            <Code2 color={theme.accent} size={26} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "bold", letterSpacing: "-0.5px", color: theme.textMain }}>CodeForge</h2>
            <span style={{ fontSize: "11px", color: theme.accent, fontWeight: "600" }}>v1.0 Cloud IDE</span>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
          <NavItem icon={<Home size={18} />} label="Dashboard" active={activeTab === "Dashboard"} onClick={() => setActiveTab("Dashboard")} />
          <NavItem icon={<Folder size={18} />} label="My Workspaces" active={activeTab === "Workspaces"} onClick={() => setActiveTab("Workspaces")} />
          <NavItem icon={<Users size={18} />} label="Live Rooms" active={activeTab === "Rooms"} onClick={() => setActiveTab("Rooms")} />
          <NavItem icon={<Bot size={18} />} label="AI Assistant" active={activeTab === "AI"} onClick={() => setActiveTab("AI")} />
        </nav>

        <div className="cf-theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
          <span style={{ fontSize: "13px", fontWeight: "600", color: theme.textMuted }}>Theme Mode</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {isDarkMode ? <Moon size={16} color="#58a6ff" /> : <Sun size={16} color="#d29922" />}
            <span style={{ fontSize: "12px", color: theme.textMain, fontWeight: "bold" }}>{isDarkMode ? "Dark" : "Light"}</span>
          </div>
        </div>

        {/* User Card with Sign Out */}
        <div style={{ marginTop: "15px", padding: "14px", backgroundColor: theme.bg, borderRadius: "10px", border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: theme.accent, display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold", color: isDarkMode ? "#080c14" : "#ffffff", fontSize: "14px" }}>
            {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: theme.textMain, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.username || "Developer"}
            </p>
            <p style={{ margin: 0, fontSize: "11px", color: theme.textMuted }}>Pro Sandbox</p>
          </div>
          <button 
            onClick={handleLogout} 
            title="Sign Out" 
            style={{ background: "transparent", border: "none", cursor: "pointer", color: theme.textMuted, padding: "4px", borderRadius: "6px" }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* 🖥️ MAIN CONTENT AREA */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        <header style={{ padding: "18px 40px", borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.panel, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ position: "relative", width: "380px" }}>
            <Search size={18} color={theme.textMuted} style={{ position: "absolute", left: "14px", top: "12px" }} />
            <input className="cf-search-input" type="text" placeholder="Search saved workspaces..." />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button className="cf-btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> New Workspace
            </button>
            <button 
              onClick={handleLogout} 
              className="cf-btn-secondary"
              title="Sign Out"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>

        <div className="cf-scrollable" style={{ padding: "36px 40px", flex: 1 }}>
          <div style={{ maxWidth: "1300px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
            
            <div style={{ background: `linear-gradient(135deg, ${theme.accentGlow} 0%, ${theme.panel} 100%)`, border: `1px solid ${theme.border}`, padding: "28px", borderRadius: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <ShieldCheck size={18} color="#3fb950" />
                  <span style={{ fontSize: "12px", color: "#3fb950", fontWeight: "bold" }}>Docker Container Engine Ready</span>
                </div>
                <h2 style={{ margin: "0 0 6px 0", fontSize: "22px", fontWeight: "bold", color: theme.textMain }}>
                  Welcome to CodeForge, {user?.username || "Developer"} 👋
                </h2>
                <p style={{ margin: 0, fontSize: "14px", color: theme.textMuted }}>
                  Spin up an isolated cloud sandbox or pick up right where you left off.
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr", gap: "32px" }}>
              
              <section style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin: 0, fontSize: "16px", color: theme.textMuted, display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" }}>
                    <Clock size={18} color={theme.accent} /> Your Saved Workspaces
                  </h3>
                  <span 
                    style={{ fontSize: "13px", color: theme.accent, cursor: "pointer", fontWeight: "500", display: "flex", alignItems: "center", gap: "4px" }} 
                    onClick={() => setIsModalOpen(true)}
                  >
                    + New Project <ArrowUpRight size={14} />
                  </span>
                </div>

                {loading ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "12px", gap: "10px" }}>
                    <Loader2 size={28} className="animate-spin" color={theme.accent} />
                    <span style={{ fontSize: "13px", color: theme.textMuted }}>Loading your cloud projects...</span>
                  </div>
                ) : workspaces.length === 0 ? (
                  <div style={{ padding: "40px 20px", textAlign: "center", backgroundColor: theme.panel, border: `1px dashed ${theme.border}`, borderRadius: "12px" }}>
                    <Folder size={36} color={theme.textMuted} style={{ margin: "0 auto 12px auto" }} />
                    <h4 style={{ margin: "0 0 6px 0", color: theme.textMain, fontSize: "15px" }}>No Workspaces Found</h4>
                    <p style={{ margin: "0 0 16px 0", color: theme.textMuted, fontSize: "13px" }}>Create your first sandbox to start coding and saving state.</p>
                    <button className="cf-btn-primary" style={{ margin: "0 auto" }} onClick={() => setIsModalOpen(true)}>
                      <Plus size={16} /> Create Workspace
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                    {workspaces.map((ws) => {
                      const { icon, label } = getLanguageDetails(ws.language);
                      const timeString = new Date(ws.updatedAt).toLocaleDateString() + " at " + new Date(ws.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      
                      return (
                        <WorkspaceCard 
                          key={ws._id}
                          title={ws.title} 
                          lang={label} 
                          icon={icon} 
                          time={timeString} 
                          onClick={() => navigate(`/workspace/${ws._id}`)}
                          onDelete={(e) => handleDeleteWorkspace(e, ws._id)}
                          theme={theme} 
                        />
                      );
                    })}
                  </div>
                )}
              </section>

              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                <section style={{ backgroundColor: theme.panel, border: `1px solid ${theme.border}`, padding: "24px", borderRadius: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <h3 style={{ margin: 0, fontSize: "16px", display: "flex", alignItems: "center", gap: "10px", fontWeight: "600", color: theme.textMain }}>
                      <Users size={18} color={theme.accent} /> Live Collaboration
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(63, 185, 80, 0.15)", padding: "4px 10px", borderRadius: "12px", border: "1px solid rgba(63, 185, 80, 0.3)" }}>
                      <div className="cf-pulse-dot" />
                      <span style={{ fontSize: "11px", color: "#3fb950", fontWeight: "bold" }}>Socket Active</span>
                    </div>
                  </div>

                  <p style={{ color: theme.textMuted, fontSize: "13px", lineHeight: "1.5", marginBottom: "20px" }}>
                    Pair program in real-time with synchronized code editing & live terminals.
                  </p>

                  <button className="cf-btn-secondary" style={{ width: "100%", justifyContent: "center", marginBottom: "16px" }} onClick={handleCreateRoom}>
                    <Zap size={16} color="#d29922" /> Create Room
                  </button>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <input 
                      type="text" 
                      placeholder="Room Code (e.g. CF-192)" 
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                      style={{ flex: 1, padding: "10px 12px", backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.textMain, outline: "none", fontSize: "13px" }}
                    />
                    <button className="cf-btn-primary" style={{ padding: "10px 18px" }} onClick={handleJoinRoom}>
                      Join
                    </button>
                  </div>
                </section>

                <section style={{ backgroundColor: theme.panel, border: `1px solid ${theme.border}`, padding: "24px", borderRadius: "12px" }}>
                  <h3 style={{ margin: "0 0 18px 0", fontSize: "16px", display: "flex", alignItems: "center", gap: "10px", fontWeight: "600", color: theme.textMain }}>
                    <Cpu size={18} color="#3fb950" /> Environment Telemetry
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <StatRow label="Saved Workspaces" value={workspaces.length} badge="MongoDB" theme={theme} />
                    <StatRow label="Sandbox Memory Limit" value="128 MB" badge="Docker Daemon" theme={theme} />
                    <StatRow label="AI Code Review" value="Gemini Flash" badge="Active" theme={theme} />
                  </div>
                </section>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* CREATE WORKSPACE MODAL */}
      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, backgroundColor: theme.modalOverlay, backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ width: "100%", maxWidth: "420px", backgroundColor: theme.panel, border: `1px solid ${theme.border}`, borderRadius: "14px", padding: "24px", boxShadow: theme.shadow }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "bold", color: theme.textMain }}>Create New Workspace</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: theme.textMuted, cursor: "pointer", padding: "4px" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: theme.textMuted, marginBottom: "6px" }}>
                  Workspace Title
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Binary Search Tree Solver"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.textMain, outline: "none", fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: theme.textMuted, marginBottom: "6px" }}>
                  Runtime Language
                </label>
                <select
                  value={newLang}
                  onChange={(e) => setNewLang(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: "8px", color: theme.textMain, outline: "none", fontSize: "13px" }}
                >
                  <option value="python">Python 3 (3.10-slim)</option>
                  <option value="javascript">JavaScript (Node 18)</option>
                  <option value="java">Java (Corretto 21)</option>
                  <option value="cpp">C++ (GCC/G++ 20)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${theme.border}` }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: "8px 16px", background: "transparent", border: "none", color: theme.textMuted, cursor: "pointer", fontSize: "13px" }}>
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="cf-btn-primary" style={{ padding: "8px 20px" }}>
                  {creating ? "Launching..." : "Create & Launch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <div className={`cf-nav-item ${active ? "active" : ""}`} onClick={onClick}>
    {icon}
    <span>{label}</span>
  </div>
);

const WorkspaceCard = ({ title, lang, icon, time, onClick, onDelete, theme }) => (
  <div className="cf-card" onClick={onClick}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
      <span style={{ fontSize: "28px" }}>{icon}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "11px", color: theme.textMuted, backgroundColor: theme.bg, padding: "3px 8px", borderRadius: "6px", border: `1px solid ${theme.border}` }}>
          {lang}
        </span>
        <button className="cf-card-delete" title="Delete Workspace" onClick={onDelete} style={{ color: theme.textMuted }}>
          <Trash2 size={15} />
        </button>
      </div>
    </div>
    <h4 style={{ margin: "0 0 6px 0", fontSize: "15px", color: theme.textMain, fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</h4>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
      <span style={{ fontSize: "12px", color: theme.textMuted }}>{time}</span>
      <ChevronRight size={16} color={theme.textMuted} />
    </div>
  </div>
);

const StatRow = ({ label, value, badge, theme }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: `1px solid ${theme.border}` }}>
    <div>
      <p style={{ margin: 0, color: theme.textMuted, fontSize: "13px" }}>{label}</p>
      <p style={{ margin: "2px 0 0 0", color: theme.textMain, fontSize: "16px", fontWeight: "bold" }}>{value}</p>
    </div>
    <span style={{ fontSize: "11px", color: theme.accent, backgroundColor: theme.accentGlow, padding: "3px 8px", borderRadius: "6px" }}>
      {badge}
    </span>
  </div>
);

export default Dashboard;