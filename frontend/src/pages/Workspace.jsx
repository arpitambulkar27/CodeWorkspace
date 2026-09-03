import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
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
  Save,
  BookOpen,
  Send,
  Trash2,
  CheckCircle,
  XCircle,
  Sparkles,
  Edit2,
  Folder,
  FolderPlus,
  FilePlus,
  FileCode,
  ChevronRight,
  ChevronDown,
  FileText
} from "lucide-react";

import striverA2ZData from "../data/striverA2Z.json";
import loveBabbar450Data from "../data/loveBabbar450.json";
import { getFormattedProblemMarkdown } from "../data/dsaProblemDetails";

// Default clean starter code templates (Scratch code from user)
const LANGUAGE_BOILERPLATE = {
  python: '# Write your Python solution here\ndef main():\n    # write your code here\n    pass\n\nif __name__ == "__main__":\n    main()',
  javascript: '// Write your JavaScript solution here\nfunction main() {\n  // write your code here\n}\n\nmain();',
  java: '// Write your Java solution here\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // write your code here\n    }\n}',
  cpp: '// Write your C++ solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // write your code here\n    return 0;\n}',
};

const DEFAULT_FILE_NAMES = {
  python: "main.py",
  javascript: "main.js",
  java: "Main.java",
  cpp: "main.cpp",
};

// Initialize Socket connection
const socket = io("http://localhost:5000", {
  autoConnect: true,
});

export default function Workspace() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Query Params
  const roomParam = searchParams.get("room") || (id ? `CF-${id.slice(-6)}` : "default-room");
  const langParam = searchParams.get("lang") || "python";
  const problemSlug = searchParams.get("problem");

  // Workspace & Code State
  const [workspaceTitle, setWorkspaceTitle] = useState("Untitled Workspace");
  const [editingTitle, setEditingTitle] = useState(false);
  const [language, setLanguage] = useState(langParam);
  const [code, setCode] = useState(LANGUAGE_BOILERPLATE[langParam] || LANGUAGE_BOILERPLATE.python);
  const [stdinInput, setStdinInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState(1);
  const [activeTab, setActiveTab] = useState("output"); // 'output' | 'stdin'
  const [copied, setCopied] = useState(false);

  // File & Folder Tree State (Starts Folder Only, No Files by Default)
  const [files, setFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [explorerOpen, setExplorerOpen] = useState(true);

  // Problem State (LeetCode View)
  const [problem, setProblem] = useState(null);
  const [problemLeftPanelOpen, setProblemLeftPanelOpen] = useState(!!problemSlug);
  const [scorecard, setScorecard] = useState(null);

  // Gemini AI Drawer State (Manual triggering on button click)
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiMode, setAiMode] = useState("hints"); // 'hints' | 'analysis'
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");

  const editorRef = useRef(null);
  const isRemoteChange = useRef(false);
  const token = localStorage.getItem("token");

  // 1. Fetch Saved Workspace Data if ID exists
  useEffect(() => {
    if (id) {
      fetchWorkspaceData(id);
    } else if (!problemSlug) {
      const rootFolder = {
        id: `folder-root-${Date.now()}`,
        name: "src",
        type: "folder",
        parentId: null,
      };
      setFiles([rootFolder]);
      setSelectedFolderId(rootFolder.id);
      setExpandedFolders({ [rootFolder.id]: true });
      setExplorerOpen(true);
      setActiveFileId(null);
      setCode("");
    }
  }, [id]);

  // 2. Fetch DSA Problem Data if problem slug exists
  useEffect(() => {
    if (problemSlug) {
      fetchProblemData(problemSlug);
    }
  }, [problemSlug, language]);

  const fetchWorkspaceData = async (wsId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/workspaces/${wsId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data) {
        setWorkspaceTitle(res.data.title || "Untitled Workspace");
        const loadedLang = res.data.language || "python";
        setLanguage(loadedLang);

        if (res.data.stdinInput) {
          setStdinInput(res.data.stdinInput);
        }

        if (Array.isArray(res.data.files) && res.data.files.length > 0) {
          setFiles(res.data.files);
          const firstFile = res.data.files.find((f) => f.type === "file");
          const firstFolder = res.data.files.find((f) => f.type === "folder");

          if (firstFolder) {
            setSelectedFolderId(firstFolder.id);
            setExpandedFolders({ [firstFolder.id]: true });
            setExplorerOpen(true);
          }

          if (firstFile) {
            setActiveFileId(firstFile.id);
            setCode(firstFile.content || "");
          } else {
            setActiveFileId(null);
            setCode("");
          }
        } else {
          const rootFolder = {
            id: `folder-root-${Date.now()}`,
            name: res.data.title || "src",
            type: "folder",
            parentId: null,
          };
          setFiles([rootFolder]);
          setSelectedFolderId(rootFolder.id);
          setExpandedFolders({ [rootFolder.id]: true });
          setExplorerOpen(true);
          setActiveFileId(null);
          setCode("");
        }
      }
    } catch (err) {
      console.error("Failed to load workspace:", err);
    }
  };

  const fetchProblemData = async (slug) => {
    let foundStaticProb = null;
    const allSheets = [striverA2ZData, loveBabbar450Data];
    
    for (const sheetObj of allSheets) {
      for (const topic of sheetObj.topics || []) {
        for (const prob of topic.problems || []) {
          if (prob.slug === slug || prob.id === slug) {
            foundStaticProb = prob;
            break;
          }
        }
        if (foundStaticProb) break;
      }
      if (foundStaticProb) break;
    }

    if (foundStaticProb) {
      const fullMarkdown = getFormattedProblemMarkdown(
        foundStaticProb.title,
        foundStaticProb.slug || slug,
        foundStaticProb.difficulty || "Easy",
        foundStaticProb.platform || "LeetCode/GFG",
        foundStaticProb.url || "https://leetcode.com/"
      );

      const formattedProb = {
        title: foundStaticProb.title,
        slug: foundStaticProb.slug || slug,
        category: foundStaticProb.category || "DSA",
        difficulty: foundStaticProb.difficulty || "Easy",
        externalUrl: foundStaticProb.url || "https://leetcode.com/",
        platform: foundStaticProb.platform || "LeetCode/GFG",
        description: fullMarkdown,
        starterCode: {},
        testCases: []
      };

      setProblem(formattedProb);
      setProblemLeftPanelOpen(true);
      setExplorerOpen(false);

      const starter = LANGUAGE_BOILERPLATE[language] || LANGUAGE_BOILERPLATE.python;
      setCode(starter);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/api/problems/${slug}`);
      if (res.data) {
        const fullMarkdown = getFormattedProblemMarkdown(
          res.data.title || "DSA Problem",
          slug,
          res.data.difficulty || "Medium",
          res.data.platform || "LeetCode/GFG",
          res.data.url || "https://leetcode.com/"
        );

        setProblem({
          ...res.data,
          description: fullMarkdown
        });
        setProblemLeftPanelOpen(true);
        setExplorerOpen(false);

        const starter = LANGUAGE_BOILERPLATE[language] || LANGUAGE_BOILERPLATE.python;
        setCode(starter);
      }
    } catch (err) {
      console.error("Failed to load DSA problem:", err);
    }
  };

  // 3. Socket.io Multiplayer Setup
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    let username = "Anonymous";
    if (userStr) {
      try {
        username = JSON.parse(userStr).username || "Developer";
      } catch (e) {
        username = "Developer";
      }
    }

    socket.emit("join-room", { roomId: roomParam, roomCode: roomParam, username });

    const handleRemoteCodeUpdate = (newCode) => {
      isRemoteChange.current = true;
      setCode(newCode);
      if (activeFileId) {
        setFiles((prev) =>
          prev.map((f) => (f.id === activeFileId ? { ...f, content: newCode } : f))
        );
      }
    };

    socket.on("code-update", handleRemoteCodeUpdate);
    socket.on("code-change", handleRemoteCodeUpdate);

    socket.on("room-participants", (data) => {
      if (data.count) setConnectedUsers(data.count);
    });

    socket.on("execution-result", (data) => {
      setIsLoading(false);
      setActiveTab("output");

      const outputText = data.output || data.stdout;
      const errorText = data.error || data.stderr;

      if (errorText && errorText.trim() !== "") {
        setOutput(`Execution Output:\n${outputText || ""}\n\nErrors:\n${errorText}`);
      } else if (outputText !== undefined && outputText.trim() !== "") {
        setOutput(outputText);
      } else {
        setOutput("Program executed successfully with no stdout output.");
      }
    });

    return () => {
      socket.off("code-update", handleRemoteCodeUpdate);
      socket.off("code-change", handleRemoteCodeUpdate);
      socket.off("room-participants");
      socket.off("execution-result");
    };
  }, [roomParam, activeFileId]);

  // Language Change Handler
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    let targetCode = LANGUAGE_BOILERPLATE[newLang] || LANGUAGE_BOILERPLATE.python;
    setCode(targetCode);
    if (activeFileId) {
      setFiles((prev) =>
        prev.map((f) => (f.id === activeFileId ? { ...f, content: targetCode, language: newLang } : f))
      );
    }
    socket.emit("code-change", { roomId: roomParam, roomCode: roomParam, code: targetCode });
  };

  // Handle Monaco Editor Change
  const handleEditorChange = (value) => {
    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }
    const val = value || "";
    setCode(val);
    if (activeFileId) {
      setFiles((prev) =>
        prev.map((f) => (f.id === activeFileId ? { ...f, content: val } : f))
      );
    }
    socket.emit("code-change", { roomId: roomParam, roomCode: roomParam, code: val });
  };

  // File & Folder Operations
  const handleCreateFile = (targetParentId = null) => {
    const parent = targetParentId !== null ? targetParentId : (selectedFolderId || files.find(f => f.type === "folder")?.id || null);
    const defaultExt = DEFAULT_FILE_NAMES[language] || "main.txt";
    const name = window.prompt(`Enter new file name (e.g. ${defaultExt}, utils.py):`);
    if (!name || !name.trim()) return;

    const initialContent = LANGUAGE_BOILERPLATE[language] || LANGUAGE_BOILERPLATE.python;

    const newFile = {
      id: `file-${Date.now()}`,
      name: name.trim(),
      type: "file",
      parentId: parent,
      content: initialContent,
      language,
    };

    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setCode(initialContent);
  };

  const handleCreateFolder = (targetParentId = null) => {
    const parent = targetParentId !== null ? targetParentId : selectedFolderId;
    const name = window.prompt("Enter new folder name (e.g. components, src):");
    if (!name || !name.trim()) return;

    const newFolder = {
      id: `folder-${Date.now()}`,
      name: name.trim(),
      type: "folder",
      parentId: parent,
    };

    setFiles((prev) => [...prev, newFolder]);
    setExpandedFolders((prev) => ({ ...prev, [newFolder.id]: true }));
    setSelectedFolderId(newFolder.id);
  };

  const handleDeleteItem = (e, item) => {
    e.stopPropagation();
    if (!window.confirm(`Delete ${item.type} "${item.name}"?`)) return;

    const idsToDelete = new Set([item.id]);
    if (item.type === "folder") {
      const collectChildren = (folderId) => {
        files.filter((f) => f.parentId === folderId).forEach((child) => {
          idsToDelete.add(child.id);
          if (child.type === "folder") collectChildren(child.id);
        });
      };
      collectChildren(item.id);
    }

    setFiles((prev) => prev.filter((f) => !idsToDelete.has(f.id)));
    if (idsToDelete.has(activeFileId)) {
      const remainingFiles = files.filter((f) => !idsToDelete.has(f.id) && f.type === "file");
      if (remainingFiles.length > 0) {
        setActiveFileId(remainingFiles[0].id);
        setCode(remainingFiles[0].content || "");
      } else {
        setActiveFileId(null);
        setCode("");
      }
    }
  };

  const handleSelectFile = (file) => {
    setActiveFileId(file.id);
    setCode(file.content || "");
  };

  const toggleFolder = (folderId) => {
    setSelectedFolderId(folderId);
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  // Keyboard Shortcuts (Ctrl+S to Save)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSaveWorkspace();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [id, workspaceTitle, code, language, files, stdinInput]);

  // Save Workspace State to MongoDB
  const handleSaveWorkspace = async () => {
    if (!id) return;
    try {
      setSaving(true);
      await axios.put(
        `http://localhost:5000/api/workspaces/${id}`,
        {
          title: workspaceTitle,
          language,
          code,
          files,
          stdinInput,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error("Save Workspace Error:", err);
    } finally {
      setSaving(false);
    }
  };

  // Run Code Execution inside Docker Sandbox
  const handleRunCode = async () => {
    setIsLoading(true);
    setActiveTab("output");
    setOutput("⏳ Dispatching job to Docker sandbox...");

    try {
      const res = await axios.post("http://localhost:5000/api/run", {
        language,
        code,
        stdin: stdinInput,
        stdinInput,
        roomId: roomParam,
        roomCode: roomParam,
      });

      if (res.data && res.data.status === "completed") {
        setIsLoading(false);
        const outStr = res.data.output || res.data.stdout;
        const errStr = res.data.stderr;
        if (errStr && errStr.trim() !== "") {
          setOutput(`Execution Output:\n${outStr || ""}\n\nErrors:\n${errStr}`);
        } else {
          setOutput(outStr || "Program executed successfully with no stdout output.");
        }
      }
    } catch (error) {
      setIsLoading(false);
      const errMsg = error.response?.data?.error || "Error executing code in Docker container runner.";
      setOutput(`Execution Error:\n${errMsg}`);
    }
  };

  // Toggle AI Drawer without auto-running AI request
  const toggleAIDrawer = () => {
    setAiDrawerOpen((prev) => !prev);
  };

  // Gemini AI Code Review / Hints / Analysis Handler
  const handleAIReview = async (mode = "hints") => {
    setAiDrawerOpen(true);
    setAiMode(mode);
    setAiLoading(true);
    setAiAnalysis("");

    try {
      const response = await axios.post("http://localhost:5000/api/ai/review", {
        code,
        language,
        type: mode,
        problemTitle: problem ? problem.title : undefined,
        problemDescription: problem ? problem.description : undefined,
      });

      let rawOutput = response.data.review || response.data.analysis || "No AI output returned.";
      const cleanOutput = rawOutput.replace(/\$|\\mathcal|\{|\}/g, "");
      setAiAnalysis(cleanOutput);
    } catch (error) {
      setAiAnalysis(`⚠️ Gemini AI Request Failed:\n${error.response?.data?.error || error.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomParam);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render Tree Component
  const renderTree = (parentId = null, level = 0) => {
    const children = files.filter((f) => f.parentId === parentId);
    if (children.length === 0) return null;

    return children.map((item) => {
      const isFolder = item.type === "folder";
      const isExpanded = expandedFolders[item.id];
      const isActive = item.id === activeFileId;
      const isSelectedFolder = item.id === selectedFolderId;

      return (
        <div key={item.id} style={{ paddingLeft: `${level * 12}px` }}>
          <div
            onClick={() => (isFolder ? toggleFolder(item.id) : handleSelectFile(item))}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "5px 8px",
              borderRadius: "6px",
              cursor: "pointer",
              backgroundColor: isActive ? "#27272a" : isSelectedFolder ? "#18181b" : "transparent",
              color: isActive ? "#ffffff" : "#f4f4f5",
              fontSize: "12.5px",
              margin: "1px 0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden" }}>
              {isFolder ? (
                <>
                  {isExpanded ? <ChevronDown size={14} color="#a1a1aa" /> : <ChevronRight size={14} color="#a1a1aa" />}
                  <Folder size={15} color="#ffffff" />
                </>
              ) : (
                <FileCode size={15} color={isActive ? "#ffffff" : "#a1a1aa"} />
              )}
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.name}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {isFolder && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleCreateFile(item.id); }}
                  title="Add file inside folder"
                  style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer", padding: "2px" }}
                >
                  <FilePlus size={13} />
                </button>
              )}
              <button
                onClick={(e) => handleDeleteItem(e, item)}
                title="Delete"
                style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer", padding: "2px" }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {isFolder && isExpanded && renderTree(item.id, level + 1)}
        </div>
      );
    });
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#09090b", color: "#ffffff", fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif", overflow: "hidden" }}>
      
      {/* 1. Left Vertical Activity Bar (File Explorer, Live Collab, AI Help) */}
      <div style={{ width: "52px", borderRight: "1px solid #27272a", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "16px", gap: "18px", backgroundColor: "#0c0c0e", zIndex: 20 }}>
        <button onClick={() => navigate("/dashboard")} title="Back to Dashboard" style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer", padding: "6px", borderRadius: "8px" }}>
          <ArrowLeft size={18} />
        </button>

        {problem && (
          <button onClick={() => setProblemLeftPanelOpen(!problemLeftPanelOpen)} title="Problem Description (Left Panel)" style={{ background: problemLeftPanelOpen ? "#27272a" : "none", border: "none", color: problemLeftPanelOpen ? "#ffffff" : "#a1a1aa", cursor: "pointer", padding: "6px", borderRadius: "8px" }}>
            <BookOpen size={18} />
          </button>
        )}

        <button onClick={() => setExplorerOpen(!explorerOpen)} title="Toggle File Explorer" style={{ background: explorerOpen ? "#27272a" : "none", border: "none", color: explorerOpen ? "#ffffff" : "#a1a1aa", cursor: "pointer", padding: "6px", borderRadius: "8px" }}>
          <Folder size={18} />
        </button>

        <button onClick={toggleAIDrawer} title="Gemini AI Assistance" style={{ background: aiDrawerOpen ? "#27272a" : "none", border: "none", color: aiDrawerOpen ? "#ffffff" : "#a1a1aa", cursor: "pointer", padding: "6px", borderRadius: "8px" }}>
          <Bot size={18} color="#ffffff" />
        </button>

        <button onClick={copyRoomCode} title="Live Collab / Share Room Code" style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer", padding: "6px", borderRadius: "8px" }}>
          {copied ? <Check size={18} color="#ffffff" /> : <Users size={18} />}
        </button>
      </div>

      {/* 2. LEETCODE-STYLE LEFT PROBLEM PANEL */}
      {problemLeftPanelOpen && problem && (
        <div style={{ width: "420px", backgroundColor: "#0c0c0e", borderRight: "1px solid #27272a", display: "flex", flexDirection: "column", flexShrink: 0, zIndex: 15 }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #18181b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <BookOpen size={17} color="#ffffff" />
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#ffffff" }}>Problem Statement</span>
            </div>
            <button onClick={() => setProblemLeftPanelOpen(false)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
              ✕
            </button>
          </div>

          <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 10px 0", fontSize: "18px", fontWeight: "700", color: "#ffffff" }}>{problem.title}</h2>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#ffffff", backgroundColor: "#18181b", border: "1px solid #3f3f46", padding: "3px 8px", borderRadius: "6px" }}>
              {problem.difficulty}
            </span>

            <div style={{ margin: "18px 0", fontSize: "13px", color: "#a1a1aa", lineHeight: "1.6" }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem.description}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* 3. File Explorer Sidebar */}
      {explorerOpen && !problemLeftPanelOpen && (
        <div style={{ width: "230px", borderRight: "1px solid #27272a", backgroundColor: "#0c0c0e", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #18181b", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", color: "#a1a1aa", textTransform: "uppercase" }}>EXPLORER</span>
            
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={() => handleCreateFile(null)} title="New File in Folder" style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
                <FilePlus size={15} />
              </button>
              <button onClick={() => handleCreateFolder(null)} title="New Folder" style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
                <FolderPlus size={15} />
              </button>
            </div>
          </div>

          <div style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
            {files.length === 0 ? (
              <div style={{ fontSize: "12px", color: "#71717a", padding: "12px 8px" }}>
                No folder created.
              </div>
            ) : (
              renderTree(null, 0)
            )}
          </div>
        </div>
      )}

      {/* 4. MAIN IDE AREA */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* TOP HEADER BAR */}
        <div style={{ height: "54px", backgroundColor: "#121215", borderBottom: "1px solid #27272a", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ padding: "6px", backgroundColor: "#18181b", borderRadius: "8px", border: "1px solid #3f3f46" }}>
              <Code2 size={18} color="#ffffff" />
            </div>

            {problem ? (
              <div style={{ fontWeight: "700", fontSize: "15px", color: "#ffffff" }}>
                Problem: {problem.title}
              </div>
            ) : editingTitle ? (
              <input
                type="text"
                value={workspaceTitle}
                onChange={(e) => setWorkspaceTitle(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
                autoFocus
                style={{ backgroundColor: "#09090b", border: "1px solid #3f3f46", borderRadius: "6px", color: "#ffffff", padding: "4px 8px", fontSize: "14px", fontWeight: "bold", outline: "none" }}
              />
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }} onClick={() => setEditingTitle(true)}>
                <span style={{ fontWeight: "700", fontSize: "15px", color: "#ffffff" }}>{workspaceTitle}</span>
                <Edit2 size={13} color="#a1a1aa" />
              </div>
            )}

            {/* Auto-Save Indicator */}
            {id && !problem && (
              <span style={{ fontSize: "11px", color: saveSuccess ? "#ffffff" : "#a1a1aa", display: "flex", alignItems: "center", gap: "4px", backgroundColor: "#18181b", padding: "3px 8px", borderRadius: "6px", border: "1px solid #27272a" }}>
                {saveSuccess ? <Check size={12} color="#ffffff" /> : null}
                {saving ? "Saving..." : saveSuccess ? "Saved" : "Ctrl+S to save"}
              </span>
            )}
          </div>

          {/* Action Button Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              style={{ backgroundColor: "#09090b", color: "#ffffff", border: "1px solid #27272a", borderRadius: "8px", padding: "6px 12px", fontSize: "13px", outline: "none", cursor: "pointer", fontWeight: "600" }}
            >
              <option value="python">Python 3</option>
              <option value="javascript">JavaScript (Node.js)</option>
              <option value="java">Java 21</option>
              <option value="cpp">C++ 20</option>
            </select>

            {/* Room Share Pill */}
            <button
              onClick={copyRoomCode}
              style={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px", padding: "6px 12px", color: "#a1a1aa", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
            >
              <Users size={14} color="#ffffff" />
              <span>Room: {roomParam}</span>
              <span style={{ backgroundColor: "#27272a", color: "#ffffff", fontSize: "10px", padding: "1px 5px", borderRadius: "4px", fontWeight: "bold" }}>{connectedUsers} online</span>
            </button>

            {/* Save Button */}
            {id && !problem && (
              <button
                onClick={handleSaveWorkspace}
                disabled={saving}
                style={{ backgroundColor: "#121215", border: "1px solid #27272a", color: "#ffffff", padding: "7px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Save size={14} />
                <span>{saving ? "Saving..." : "Save"}</span>
              </button>
            )}

            {/* Run Code Button */}
            <button
              onClick={handleRunCode}
              disabled={isLoading}
              style={{ backgroundColor: "#ffffff", color: "#09090b", border: "none", padding: "7px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play size={14} />
                  <span>Run Code</span>
                </>
              )}
            </button>

          </div>
        </div>

        {/* MONACO EDITOR & BOTTOM TERMINAL */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
          
          {/* Monaco Editor Canvas or Folder Placeholder */}
          <div style={{ flex: 1, position: "relative" }}>
            {!activeFileId && !problem ? (
              <div style={{ width: "100%", height: "100%", backgroundColor: "#09090b", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", boxSizing: "border-box" }}>
                <div style={{ width: "54px", height: "54px", borderRadius: "14px", background: "#18181b", border: "1px solid #3f3f46", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  <Folder size={26} color="#ffffff" />
                </div>
                <h3 style={{ margin: "0 0 6px 0", fontSize: "17px", fontWeight: "800", color: "#ffffff" }}>Root Folder Initialized</h3>
                <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "#a1a1aa", maxWidth: "380px", textAlign: "center" }}>
                  This workspace starts with a root folder. Create a file inside this folder to start writing your code!
                </p>
                <button 
                  onClick={() => handleCreateFile(selectedFolderId || files.find(f => f.type === "folder")?.id || null)}
                  style={{ backgroundColor: "#ffffff", color: "#09090b", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <FilePlus size={15} /> Create File in Folder
                </button>
              </div>
            ) : (
              <Editor
                height="100%"
                language={language === "cpp" ? "cpp" : language}
                theme="vs-dark"
                value={code}
                onChange={handleEditorChange}
                onMount={(editor, monaco) => {
                  editorRef.current = editor;

                  const remeasure = () => {
                    if (monaco && monaco.editor && typeof monaco.editor.remeasureFonts === "function") {
                      monaco.editor.remeasureFonts();
                    }
                    if (editor && typeof editor.layout === "function") {
                      editor.layout();
                    }
                  };

                  remeasure();
                  setTimeout(remeasure, 100);

                  if (document.fonts && document.fonts.ready) {
                    document.fonts.ready.then(remeasure);
                  }
                }}
                options={{
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', Consolas, 'Courier New', monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 12, bottom: 12 },
                  readOnly: false,
                  cursorStyle: "line",
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                  matchBrackets: "always",
                  renderLineHighlight: "all",
                  selectionHighlight: true,
                  occurrencesHighlight: "on",
                  bracketPairColorization: { enabled: true },
                }}
              />
            )}
          </div>

          {/* DUAL TERMINAL */}
          <div style={{ height: "230px", backgroundColor: "#121215", borderTop: "1px solid #27272a", display: "flex", flexDirection: "column" }}>
            
            <div style={{ height: "36px", backgroundColor: "#18181b", borderBottom: "1px solid #27272a", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
              <div style={{ display: "flex", gap: "4px" }}>
                <button
                  onClick={() => setActiveTab("output")}
                  style={{ backgroundColor: activeTab === "output" ? "#121215" : "transparent", border: "1px solid", borderColor: activeTab === "output" ? "#27272a" : "transparent", borderBottom: activeTab === "output" ? "none" : "transparent", color: activeTab === "output" ? "#ffffff" : "#a1a1aa", padding: "4px 12px", borderRadius: "6px 6px 0 0", fontSize: "12px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <TerminalIcon size={14} color="#ffffff" /> Output Terminal
                </button>

                <button
                  onClick={() => setActiveTab("stdin")}
                  style={{ backgroundColor: activeTab === "stdin" ? "#121215" : "transparent", border: "1px solid", borderColor: activeTab === "stdin" ? "#27272a" : "transparent", borderBottom: activeTab === "stdin" ? "none" : "transparent", color: activeTab === "stdin" ? "#ffffff" : "#a1a1aa", padding: "4px 12px", borderRadius: "6px 6px 0 0", fontSize: "12px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <MessageSquare size={14} color="#a1a1aa" /> Custom Stdin Input
                </button>
              </div>

              <div style={{ fontSize: "11px", color: "#a1a1aa" }}>
                Docker Sandbox Console
              </div>
            </div>

            <div style={{ flex: 1, padding: "14px 18px", overflowY: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", lineHeight: "1.6", color: "#ffffff" }}>
              {activeTab === "output" ? (
                <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                  {output || "Output will appear here after clicking Run Code..."}
                </pre>
              ) : (
                <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <label style={{ display: "block", fontSize: "11px", color: "#a1a1aa", marginBottom: "6px", fontWeight: "bold" }}>
                    ENTER PROGRAM INPUT (ENTER INPUT VALUES HERE BEFORE CLICKING RUN CODE):
                  </label>
                  <textarea
                    value={stdinInput}
                    onChange={(e) => setStdinInput(e.target.value)}
                    placeholder="Type custom program input values here (one per line)...&#10;e.g.&#10;5&#10;10 20 30 40 50"
                    style={{ flex: 1, width: "100%", boxSizing: "border-box", backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "8px", padding: "10px", color: "#ffffff", fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", outline: "none", resize: "none" }}
                  />
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* GEMINI AI ASSISTANCE DRAWER (2 OPTIONS: HINTS & ANALYSIS) */}
      {aiDrawerOpen && (
        <div style={{ width: "420px", backgroundColor: "#121215", borderLeft: "1px solid #27272a", display: "flex", flexDirection: "column", zIndex: 30 }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #27272a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
              <Bot size={18} color="#ffffff" /> Gemini AI Assistant
            </h3>
            <button onClick={() => setAiDrawerOpen(false)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
              ✕
            </button>
          </div>

          <div style={{ padding: "10px 18px", borderBottom: "1px solid #27272a", display: "flex", gap: "10px", backgroundColor: "#0c0c0e" }}>
            <button
              onClick={() => handleAIReview("hints")}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "12.5px",
                fontWeight: "700",
                cursor: "pointer",
                backgroundColor: aiMode === "hints" && aiAnalysis ? "#ffffff" : "#121215",
                color: aiMode === "hints" && aiAnalysis ? "#09090b" : "#a1a1aa",
                border: aiMode === "hints" && aiAnalysis ? "none" : "1px solid #27272a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.2s ease"
              }}
            >
              <Sparkles size={14} /> 💡 Get Hints
            </button>

            <button
              onClick={() => handleAIReview("analysis")}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "12.5px",
                fontWeight: "700",
                cursor: "pointer",
                backgroundColor: aiMode === "analysis" && aiAnalysis ? "#ffffff" : "#121215",
                color: aiMode === "analysis" && aiAnalysis ? "#09090b" : "#a1a1aa",
                border: aiMode === "analysis" && aiAnalysis ? "none" : "1px solid #27272a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.2s ease"
              }}
            >
              <TerminalIcon size={14} /> 📊 Complexity Analysis
            </button>
          </div>

          <div style={{ flex: 1, padding: "18px", overflowY: "auto", fontSize: "13px", lineHeight: "1.6" }}>
            {aiLoading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: "12px", color: "#a1a1aa" }}>
                <Loader2 size={28} className="animate-spin" color="#ffffff" />
                <span>{aiMode === "hints" ? "Formulating GFG-style hint..." : "Evaluating Big-O complexity of your code..."}</span>
              </div>
            ) : aiAnalysis ? (
              <div className="markdown-body" style={{ color: "#ffffff" }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiAnalysis}</ReactMarkdown>
              </div>
            ) : (
              <div style={{ padding: "40px 16px", textAlign: "center", color: "#a1a1aa", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <Bot size={32} color="#52525b" />
                <div>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "700", color: "#ffffff" }}>Gemini AI Assistant</h4>
                  <p style={{ margin: 0, fontSize: "12.5px", color: "#a1a1aa" }}>
                    Select an option above to generate a short GFG-style hint or analyze your code's Big-O complexity.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}