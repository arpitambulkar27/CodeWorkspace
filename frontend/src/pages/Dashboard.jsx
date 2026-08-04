import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Code2, Plus, Search, Home, Folder, Users, Bot, 
  Clock, GitBranch, Cpu, ShieldCheck, ChevronRight, 
  Zap, Sun, Moon, ArrowUpRight, Sparkles
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [roomCodeInput, setRoomCodeInput] = useState("");

  // Handler for launching a new or existing workspace
  const handleLaunchWorkspace = (params = "") => {
    navigate(`/workspace${params}`);
  };

  // Handler for joining a live collaboration room
  const handleJoinRoom = () => {
    if (roomCodeInput.trim()) {
      navigate(`/workspace?room=${encodeURIComponent(roomCodeInput.trim())}`);
    }
  };

  // Handler for creating a new collaboration room
  const handleCreateRoom = () => {
    const randomRoomId = `CF-${Math.floor(1000 + Math.random() * 9000)}`;
    navigate(`/workspace?room=${randomRoomId}&mode=create`);
  };

  // Dynamic Theme Configurations
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

        .cf-scrollable {
          overflow-y: auto;
        }
        .cf-scrollable::-webkit-scrollbar {
          width: 6px;
        }
        .cf-scrollable::-webkit-scrollbar-thumb {
          background: ${theme.border};
          border-radius: 4px;
        }

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
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cf-card:hover {
          transform: translateY(-6px);
          border-color: ${theme.borderHover};
          box-shadow: ${theme.shadow};
          background-color: ${theme.cardHoverBg};
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
        .cf-theme-toggle:hover {
          border-color: ${theme.accent};
        }

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

      {/* 📱 LEFT SIDEBAR NAVIGATION */}
      <aside style={{ width: "260px", backgroundColor: theme.panel, borderRight: `1px solid ${theme.border}`, padding: "24px", display: "flex", flexDirection: "column" }}>
        
        {/* Brand Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "36px" }}>
          <div style={{ padding: "8px", backgroundColor: theme.accentGlow, borderRadius: "10px", border: `1px solid ${theme.accent}` }}>
            <Code2 color={theme.accent} size={26} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "bold", letterSpacing: "-0.5px", color: theme.textMain }}>CodeForge</h2>
            <span style={{ fontSize: "11px", color: theme.accent, fontWeight: "600" }}>v1.0 Cloud AI</span>
          </div>
        </div>

        {/* Sidebar Options */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
          <NavItem icon={<Home size={18} />} label="Dashboard" active={activeTab === "Dashboard"} onClick={() => setActiveTab("Dashboard")} />
          <NavItem icon={<Folder size={18} />} label="My Workspaces" active={activeTab === "Workspaces"} onClick={() => setActiveTab("Workspaces")} />
          <NavItem icon={<Users size={18} />} label="Live Rooms" active={activeTab === "Rooms"} onClick={() => setActiveTab("Rooms")} />
          <NavItem icon={<Bot size={18} />} label="AI Assistant" active={activeTab === "AI"} onClick={() => setActiveTab("AI")} />
        </nav>

        {/* Theme Mode Toggle */}
        <div className="cf-theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
          <span style={{ fontSize: "13px", fontWeight: "600", color: theme.textMuted }}>Theme Mode</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {isDarkMode ? <Moon size={16} color="#58a6ff" /> : <Sun size={16} color="#d29922" />}
            <span style={{ fontSize: "12px", color: theme.textMain, fontWeight: "bold" }}>{isDarkMode ? "Dark" : "Light"}</span>
          </div>
        </div>

        {/* User Badge */}
        <div style={{ marginTop: "15px", padding: "14px", backgroundColor: theme.bg, borderRadius: "10px", border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: theme.accent, display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold", color: isDarkMode ? "#080c14" : "#ffffff", fontSize: "14px" }}>
            A
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: theme.textMain }}>Arpit A.</p>
            <p style={{ margin: 0, fontSize: "12px", color: theme.textMuted }}>Pro Sandbox Plan</p>
          </div>
          <Sparkles size={16} color="#d29922" />
        </div>
      </aside>

      {/* 🖥️ MAIN DASHBOARD AREA */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* TOP HEADER */}
        <header style={{ padding: "18px 40px", borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.panel, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ position: "relative", width: "380px" }}>
            <Search size={18} color={theme.textMuted} style={{ position: "absolute", left: "14px", top: "12px" }} />
            <input 
              className="cf-search-input"
              type="text" 
              placeholder="Search workspaces or room codes..." 
            />
          </div>

          {/* Single Clear IDE Entry Point */}
          <div>
            <button className="cf-btn-primary" onClick={() => handleLaunchWorkspace()}>
              <Plus size={18} /> New Workspace
            </button>
          </div>
        </header>

        {/* SCROLLABLE CONTENT BODY */}
        <div className="cf-scrollable" style={{ padding: "36px 40px", flex: 1 }}>
          <div style={{ maxWidth: "1300px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
            
            {/* Hero Welcome Banner */}
            <div style={{ background: `linear-gradient(135deg, ${theme.accentGlow} 0%, ${theme.panel} 100%)`, border: `1px solid ${theme.border}`, padding: "28px", borderRadius: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <ShieldCheck size={18} color="#3fb950" />
                  <span style={{ fontSize: "12px", color: "#3fb950", fontWeight: "bold" }}>Docker Container Engine Ready</span>
                </div>
                <h2 style={{ margin: "0 0 6px 0", fontSize: "22px", fontWeight: "bold", color: theme.textMain }}>Welcome to CodeForge Workspace 👋</h2>
                <p style={{ margin: 0, fontSize: "14px", color: theme.textMuted }}>Spin up a fresh cloud sandbox or jump back into your recent coding projects.</p>
              </div>
            </div>

            {/* MAIN DASHBOARD GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr", gap: "32px" }}>
              
              {/* LEFT COLUMN: Recent Workspaces Grid */}
              <section style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin: 0, fontSize: "16px", color: theme.textMuted, display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" }}>
                    <Clock size={18} color={theme.accent} /> Recent Workspaces
                  </h3>
                  <span style={{ fontSize: "13px", color: theme.accent, cursor: "pointer", fontWeight: "500", display: "flex", alignItems: "center", gap: "4px" }} onClick={() => handleLaunchWorkspace()}>
                    View All <ArrowUpRight size={14} />
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                  <WorkspaceCard title="Auth Service API" lang="Node.js" icon="⚡" time="2 hours ago" onClick={() => handleLaunchWorkspace("?lang=javascript")} theme={theme} />
                  <WorkspaceCard title="Tree Traversal Algo" lang="Python 3" icon="🐍" time="5 hours ago" onClick={() => handleLaunchWorkspace("?lang=python")} theme={theme} />
                  <WorkspaceCard title="Payment Microservice" lang="Java 21" icon="☕" time="Yesterday" onClick={() => handleLaunchWorkspace("?lang=java")} theme={theme} />
                  <WorkspaceCard title="Memory Allocator" lang="C++ 20" icon="⚙️" time="2 days ago" onClick={() => handleLaunchWorkspace("?lang=cpp")} theme={theme} />
                </div>
              </section>

              {/* RIGHT COLUMN: Collaboration & Telemetry */}
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                
                {/* 👥 Live Collaboration Card */}
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

                  {/* Button 1: Create Room */}
                  <button className="cf-btn-secondary" style={{ width: "100%", justifyContent: "center", marginBottom: "16px" }} onClick={handleCreateRoom}>
                    <Zap size={16} color="#d29922" /> Create Room
                  </button>

                  {/* Input + Button 2: Join Room */}
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input 
                      type="text" 
                      placeholder="Enter Room Code (e.g. CF-192)" 
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

                {/* System Telemetry */}
                <section style={{ backgroundColor: theme.panel, border: `1px solid ${theme.border}`, padding: "24px", borderRadius: "12px" }}>
                  <h3 style={{ margin: "0 0 18px 0", fontSize: "16px", display: "flex", alignItems: "center", gap: "10px", fontWeight: "600", color: theme.textMain }}>
                    <Cpu size={18} color="#3fb950" /> System Telemetry
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <StatRow label="Docker Executions" value="1,248" badge="+14 today" theme={theme} />
                    <StatRow label="AI Reviews Triggered" value="42" badge="Gemini Flash" theme={theme} />
                  </div>
                </section>

              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Helper Components ---

const NavItem = ({ icon, label, active, onClick }) => (
  <div className={`cf-nav-item ${active ? "active" : ""}`} onClick={onClick}>
    {icon}
    <span>{label}</span>
  </div>
);

const WorkspaceCard = ({ title, lang, icon, time, onClick, theme }) => (
  <div className="cf-card" onClick={onClick}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
      <span style={{ fontSize: "28px" }}>{icon}</span>
      <span style={{ fontSize: "11px", color: theme.textMuted, backgroundColor: theme.bg, padding: "3px 8px", borderRadius: "6px", border: `1px solid ${theme.border}` }}>
        {lang}
      </span>
    </div>
    <h4 style={{ margin: "0 0 6px 0", fontSize: "15px", color: theme.textMain, fontWeight: "600" }}>{title}</h4>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
      <span style={{ fontSize: "12px", color: theme.textMuted }}>Edited {time}</span>
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