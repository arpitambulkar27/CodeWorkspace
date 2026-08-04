import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { io } from "socket.io-client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Play,
  Bot,
  Terminal as TerminalIcon,
  MessageSquare,
  Users,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  Code2,
  Moon,
  Sun,
} from "lucide-react";

// Starter boilerplates for supported languages
const LANGUAGE_BOILERPLATE = {
  python: '# Write your Python code here\nprint("Hello, CodeForge Queue!")',
  javascript: '// Write your JavaScript code here\nconsole.log("Hello, CodeForge Queue!");',
  java: '// Write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CodeForge Queue!");\n    }\n}',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, CodeForge Queue!" << endl;\n    return 0;\n}',
};

// Initialize Socket connection
const socket = io("http://localhost:5000", {
  autoConnect: true,
});

export default function Workspace() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Route Params
  const roomParam = searchParams.get("room") || "default-room";
  const langParam = searchParams.get("lang") || "python";

  // State Management
  const [language, setLanguage] = useState(langParam);
  const [code, setCode] = useState(LANGUAGE_BOILERPLATE[langParam] || LANGUAGE_BOILERPLATE.python);
  const [output, setOutput] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("output"); // 'output' or 'stdin'
  const [connectedUsers, setConnectedUsers] = useState(1);
  const [copied, setCopied] = useState(false);

  // AI Drawer State
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Avoid circular loop on socket edits
  const isRemoteChange = useRef(false);

  // 1. Socket.io Room Connection & Result Synchronization
  useEffect(() => {
    // Join room on mount
    socket.emit("join-room", { roomId: roomParam, username: "Developer" });

    // Remote Code updates from peers
    socket.on("code-update", (newCode) => {
      isRemoteChange.current = true;
      setCode(newCode);
    });

    // Track active room users
    socket.on("user-joined", () => {
      setConnectedUsers((prev) => prev + 1);
    });

    // Listen for asynchronous execution results from BullMQ Worker
    socket.on("execution-result", (data) => {
      setIsLoading(false);
      setActiveTab("output");

      const outputText = data.output || data.stdout;
      const errorText = data.error || data.stderr;

      if (errorText && errorText.trim() !== "") {
        setOutput(`Execution Error:\n${errorText}`);
      } else if (outputText !== undefined && outputText.trim() !== "") {
        setOutput(outputText);
      } else {
        setOutput("Code executed successfully with no output.");
      }
    });

    return () => {
      socket.off("code-update");
      socket.off("user-joined");
      socket.off("execution-result");
    };
  }, [roomParam]);

  // Handle Monaco code edits & broadcast via Socket
  const handleEditorChange = (newValue) => {
    const updatedCode = newValue || "";
    setCode(updatedCode);

    if (!isRemoteChange.current) {
      socket.emit("code-change", { roomId: roomParam, code: updatedCode });
    }
    isRemoteChange.current = false;
  };

  // Handle Language Dropdown Change
  const handleLanguageChange = (e) => {
    const selected = e.target.value;
    setLanguage(selected);
    const boilerplate = LANGUAGE_BOILERPLATE[selected] || "";
    setCode(boilerplate);
    socket.emit("code-change", { roomId: roomParam, code: boilerplate });
  };

  // ✅ SINGLE ASYNC DECLARATION: Handles Queue execution POST request
  const handleRunCode = async () => {
    setIsLoading(true);
    setActiveTab("output");
    setOutput("⏳ Queueing job & waiting for Docker execution worker...");

    try {
      await axios.post("http://localhost:5000/api/run", {
        language,
        code,
        stdin: userInput,
        roomId: roomParam, // Pass roomId for WebSocket broadcast
      });
    } catch (error) {
      setIsLoading(false);
      setOutput(
        error.response?.data?.error ||
          "Execution Failed: Unable to reach backend server."
      );
    }
  };

  // Handles Gemini AI Review Request
  const handleAIReview = async () => {
    setAiDrawerOpen(true);
    setAiLoading(true);
    setAiAnalysis("");

    try {
      const response = await axios.post("http://localhost:5000/api/ai/review", {
        code,
        language,
      });
      setAiAnalysis(response.data.review || response.data.analysis || "No analysis returned.");
    } catch (error) {
      setAiAnalysis("❌ Failed to fetch AI review. Make sure GEMINI_API_KEY is set in your backend .env file.");
    } finally {
      setAiLoading(false);
    }
  };

  // Copy Room Link
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomParam);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#0d1117", color: "#c9d1d9", fontFamily: "sans-serif", overflow: "hidden" }}>
      {/* 1. Left Activity Bar */}
      <div style={{ width: "50px", borderRight: "1px solid #30363d", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "16px", gap: "20px", backgroundColor: "#161b22" }}>
        <button onClick={() => navigate("/")} title="Back to Dashboard" style={{ background: "none", border: "none", color: "#8b949e", cursor: "pointer" }}>
          <ArrowLeft size={20} />
        </button>
        <button onClick={() => setAiDrawerOpen(!aiDrawerOpen)} title="AI Code Reviewer" style={{ background: "none", border: "none", color: aiDrawerOpen ? "#58a6ff" : "#8b949e", cursor: "pointer" }}>
          <Bot size={22} />
        </button>
      </div>

      {/* 2. Main Workspace Layout */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Workspace Header Toolbar */}
        <div style={{ height: "50px", borderBottom: "1px solid #30363d", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", backgroundColor: "#161b22" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontWeight: "bold", color: "#58a6ff", display: "flex", alignItems: "center", gap: "6px" }}>
              <Code2 size={20} /> CodeForge IDE
            </span>

            {/* Language Selector */}
            <select value={language} onChange={handleLanguageChange} style={{ padding: "6px 12px", borderRadius: "6px", backgroundColor: "#21262d", color: "#c9d1d9", border: "1px solid #30363d", cursor: "pointer", fontSize: "13px" }}>
              <option value="python">Python 3</option>
              <option value="javascript">JavaScript (Node.js)</option>
              <option value="java">Java 21</option>
              <option value="cpp">C++ 20</option>
            </select>
          </div>

          {/* Right Header Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Room ID Badge */}
            <button onClick={copyRoomCode} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "6px", backgroundColor: "#21262d", border: "1px solid #30363d", color: "#8b949e", cursor: "pointer", fontSize: "12px" }}>
              <Users size={14} /> Room: <span style={{ color: "#c9d1d9", fontWeight: "bold" }}>{roomParam}</span>
              {copied ? <Check size={14} color="#3fb950" /> : <Copy size={14} />}
            </button>

            {/* AI Review Button */}
            <button onClick={handleAIReview} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "6px", backgroundColor: "#21262d", border: "1px solid #30363d", color: "#a371f7", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
              <Bot size={16} /> Ask AI
            </button>

            {/* Run Code Button */}
            <button onClick={handleRunCode} disabled={isLoading} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 18px", borderRadius: "6px", backgroundColor: isLoading ? "#238636 opacity-50" : "#238636", color: "#fff", border: "none", cursor: isLoading ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "13px" }}>
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              {isLoading ? "Executing..." : "Run Code"}
            </button>
          </div>
        </div>

        {/* Center Grid (Editor + Output/Stdin + AI Drawer) */}
        <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
          {/* Monaco Editor & Terminal Stack */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            {/* Monaco Editor Wrapper */}
            <div style={{ flex: 1, minHeight: 0, borderBottom: "1px solid #30363d" }}>
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={handleEditorChange}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                }}
              />
            </div>

            {/* Bottom Terminal & Custom Stdin Panel */}
            <div style={{ height: "220px", display: "flex", flexDirection: "column", backgroundColor: "#010409" }}>
              {/* Tab Header */}
              <div style={{ display: "flex", borderBottom: "1px solid #30363d", backgroundColor: "#161b22" }}>
                <button onClick={() => setActiveTab("output")} style={{ padding: "8px 16px", background: "none", border: "none", color: activeTab === "output" ? "#58a6ff" : "#8b949e", borderBottom: activeTab === "output" ? "2px solid #58a6ff" : "none", cursor: "pointer", fontWeight: "600", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <TerminalIcon size={14} /> Output Terminal
                </button>
                <button onClick={() => setActiveTab("stdin")} style={{ padding: "8px 16px", background: "none", border: "none", color: activeTab === "stdin" ? "#58a6ff" : "#8b949e", borderBottom: activeTab === "stdin" ? "2px solid #58a6ff" : "none", cursor: "pointer", fontWeight: "600", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <MessageSquare size={14} /> Custom Input (stdin)
                </button>
              </div>

              {/* Tab Contents */}
              <div style={{ flex: 1, padding: "12px", overflowY: "auto", fontSize: "13px", fontFamily: "monospace" }}>
                {activeTab === "output" ? (
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: output.includes("Error:") ? "#f85149" : "#3fb950" }}>
                    {output || 'Click "Run Code" to view execution results.'}
                  </pre>
                ) : (
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Enter custom standard inputs (stdin) here..."
                    style={{ width: "100%", height: "100%", backgroundColor: "#0d1117", color: "#c9d1d9", border: "1px solid #30363d", borderRadius: "6px", padding: "8px", fontFamily: "monospace", resize: "none", boxSizing: "border-box" }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* 3. Right Slide-out AI Review Drawer */}
          {aiDrawerOpen && (
            <div style={{ width: "380px", borderLeft: "1px solid #30363d", backgroundColor: "#161b22", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #30363d", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "bold", color: "#a371f7", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Bot size={18} /> Gemini AI Assistant
                </span>
                <button onClick={() => setAiDrawerOpen(false)} style={{ background: "none", border: "none", color: "#8b949e", cursor: "pointer", fontSize: "16px" }}>
                  ✕
                </button>
              </div>

              <div style={{ flex: 1, padding: "16px", overflowY: "auto", fontSize: "13px", lineHeight: "1.6" }}>
                {aiLoading ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#8b949e" }}>
                    <Loader2 size={16} className="animate-spin" /> Analyzing code complexity & potential bugs...
                  </div>
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {aiAnalysis || 'Click "Ask AI" in the toolbar to generate an automated review of your code.'}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}