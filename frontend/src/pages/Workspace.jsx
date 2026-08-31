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

// Starter boilerplates for supported languages
const LANGUAGE_BOILERPLATE = {
  python: '# Write your Python solution here\ndef main():\n    pass\n\nif __name__ == "__main__":\n    main()',
  javascript: '// Write your JavaScript solution here\nfunction main() {\n  \n}\n\nmain();',
  java: '// Write your Java solution here\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}',
  cpp: '// Write your C++ solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}',
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
  const sheetParam = searchParams.get("sheet");

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
  const [participantList, setParticipantList] = useState([]);
  const [activeTab, setActiveTab] = useState("output"); // 'output' | 'stdin'
  const [copied, setCopied] = useState(false);

  // File & Folder Tree State
  const [files, setFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [explorerOpen, setExplorerOpen] = useState(false);

  // Problem State (LeetCode View)
  const [problem, setProblem] = useState(null);
  const [problemLeftPanelOpen, setProblemLeftPanelOpen] = useState(!!problemSlug);
  const [submittingSolution, setSubmittingSolution] = useState(false);
  const [scorecard, setScorecard] = useState(null);

  // Gemini AI Drawer State (2 Options: 'hints' | 'analysis')
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
      const defaultFileName = DEFAULT_FILE_NAMES[langParam] || "main.txt";
      const initialFile = {
        id: `file-${Date.now()}`,
        name: defaultFileName,
        type: "file",
        parentId: null,
        content: LANGUAGE_BOILERPLATE[langParam] || LANGUAGE_BOILERPLATE.python,
        language: langParam,
      };
      setFiles([initialFile]);
      setActiveFileId(initialFile.id);
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
          const firstFile = res.data.files.find((f) => f.type === "file") || res.data.files[0];
          if (firstFile) {
            setActiveFileId(firstFile.id);
            setCode(firstFile.content || "");
          }
        } else {
          const defaultFileName = DEFAULT_FILE_NAMES[loadedLang] || "main.txt";
          const loadedCode = res.data.code && res.data.code.trim() !== "" 
            ? res.data.code 
            : (LANGUAGE_BOILERPLATE[loadedLang] || LANGUAGE_BOILERPLATE.python);

          const defaultFile = {
            id: `file-main-${Date.now()}`,
            name: defaultFileName,
            type: "file",
            parentId: null,
            content: loadedCode,
            language: loadedLang,
          };
          setFiles([defaultFile]);
          setActiveFileId(defaultFile.id);
          setCode(loadedCode);
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
      const formattedProb = {
        title: foundStaticProb.title,
        slug: foundStaticProb.slug || slug,
        category: foundStaticProb.category || "DSA",
        difficulty: foundStaticProb.difficulty || "Easy",
        externalUrl: foundStaticProb.url || "https://leetcode.com/",
        platform: foundStaticProb.platform || "LeetCode/GFG",
        description: `### ${foundStaticProb.title}\n\n**Difficulty**: ${foundStaticProb.difficulty} | **Source Platform**: ${foundStaticProb.platform || "LeetCode/GFG"}\n\nSolve the problem directly in Monaco editor using the starter code below or visit the official source problem page: [${foundStaticProb.title}](${foundStaticProb.url})\n\nSelect your preferred language (Python, JavaScript, C++, Java) from the top bar to auto-load starter code templates!`,
        starterCode: foundStaticProb.starterCode || {},
        testCases: []
      };

      setProblem(formattedProb);
      setProblemLeftPanelOpen(true);
      setExplorerOpen(false);

      const starter = formattedProb.starterCode[language] || LANGUAGE_BOILERPLATE[language] || LANGUAGE_BOILERPLATE.python;
      setCode(starter);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/api/problems/${slug}`);
      if (res.data) {
        setProblem(res.data);
        setProblemLeftPanelOpen(true);
        setExplorerOpen(false);

        let starter = LANGUAGE_BOILERPLATE[language] || LANGUAGE_BOILERPLATE.python;
        if (res.data.starterCode && res.data.starterCode[language]) {
          starter = res.data.starterCode[language];
        }
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
      if (data.participants) setParticipantList(data.participants);
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
    if (problem && problem.starterCode && problem.starterCode[newLang]) {
      targetCode = problem.starterCode[newLang];
    }
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
    const parent = targetParentId !== null ? targetParentId : selectedFolderId;
    const name = window.prompt("Enter new file name (e.g. utils.py, index.js):");
    if (!name || !name.trim()) return;

    const newFile = {
      id: `file-${Date.now()}`,
      name: name.trim(),
      type: "file",
      parentId: parent,
      content: "",
      language,
    };

    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setCode("");
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

  // Submit DSA Solution against Test Cases
  const handleSubmitSolution = async () => {
    if (!problemSlug) return;
    setSubmittingSolution(true);
    setScorecard(null);
    setActiveTab("output");
    setOutput("⏳ Running solution evaluation against test cases...");

    try {
      const res = await axios.post(`http://localhost:5000/api/problems/${problemSlug}/submit`, {
        code,
        language,
      });
      setScorecard(res.data);
      
      const summaryText = res.data.passed 
        ? `✓ ACCEPTED! All ${res.data.passedCount}/${res.data.totalTestCases} test cases passed.`
        : `❌ REJECTED! Passed ${res.data.passedCount}/${res.data.totalTestCases} test cases.`;

      const detailsText = (res.data.scoreCard || []).map((tc) => 
        `Test Case #${tc.testCaseIndex}: ${tc.passed ? "PASSED ✓" : "FAILED ❌"}\nInput: ${tc.input}\nExpected: ${tc.expectedOutput}\nActual: ${tc.actualOutput || tc.error || "N/A"}`
      ).join("\n\n");

      setOutput(`${summaryText}\n\n${detailsText}`);
    } catch (err) {
      console.error("Submit Solution Error:", err);
      setOutput(`Submission Error:\n${err.response?.data?.error || err.message}`);
    } finally {
      setSubmittingSolution(false);
    }
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
      setAiAnalysis(response.data.review || response.data.analysis || "No AI output returned.");
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
      
      {/* 1. Left Activity Icon Bar */}
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

        <button onClick={() => handleAIReview("hints")} title="Gemini AI Assistance" style={{ background: aiDrawerOpen ? "#27272a" : "none", border: "none", color: aiDrawerOpen ? "#ffffff" : "#a1a1aa", cursor: "pointer", padding: "6px", borderRadius: "8px" }}>
          <Bot size={18} color="#ffffff" />
        </button>

        <button onClick={copyRoomCode} title="Share Room Code" style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer", padding: "6px", borderRadius: "8px" }}>
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

            {/* Test Case Scorecard */}
            {scorecard && (
              <div style={{ marginTop: "20px", padding: "14px", backgroundColor: "#121215", border: "1px solid #27272a", borderRadius: "10px" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "13px", color: scorecard.passed ? "#ffffff" : "#f87171", display: "flex", alignItems: "center", gap: "6px" }}>
                  {scorecard.passed ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  <span>{scorecard.passed ? "Accepted (All Test Cases Passed!)" : "Test Case Failure"}</span>
                </h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#a1a1aa" }}>
                  Passed {scorecard.passedCount} / {scorecard.totalTestCases} test cases.
                </p>
              </div>
            )}
          </div>

          {/* Submit Solution Button inside Left Panel */}
          <div style={{ padding: "14px 18px", borderTop: "1px solid #18181b", backgroundColor: "#0c0c0e" }}>
            <button
              onClick={handleSubmitSolution}
              disabled={submittingSolution}
              style={{ width: "100%", backgroundColor: "#ffffff", color: "#09090b", border: "none", padding: "10px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
            >
              {submittingSolution ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
              <span>Submit Solution</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. File Explorer Sidebar */}
      {explorerOpen && !problemLeftPanelOpen && (
        <div style={{ width: "230px", borderRight: "1px solid #27272a", backgroundColor: "#0c0c0e", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #18181b", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", color: "#a1a1aa", textTransform: "uppercase" }}>EXPLORER</span>
            
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={() => handleCreateFile(null)} title="New File at Root" style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
                <FilePlus size={15} />
              </button>
              <button onClick={() => handleCreateFolder(null)} title="New Folder at Root" style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
                <FolderPlus size={15} />
              </button>
            </div>
          </div>

          <div style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
            {files.length === 0 ? (
              <div style={{ fontSize: "12px", color: "#71717a", padding: "12px 8px" }}>
                No files created. Click + File above.
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

            {/* Submit Solution Button if Problem */}
            {problem ? (
              <button
                onClick={handleSubmitSolution}
                disabled={submittingSolution}
                style={{ backgroundColor: "#ffffff", color: "#09090b", border: "none", padding: "7px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              >
                {submittingSolution ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                <span>Submit Solution</span>
              </button>
            ) : (
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
            )}

          </div>
        </div>

        {/* MONACO EDITOR & BOTTOM TERMINAL */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
          
          {/* Monaco Editor */}
          <div style={{ flex: 1, position: "relative" }}>
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
                setTimeout(remeasure, 300);

                if (document.fonts && document.fonts.ready) {
                  document.fonts.ready.then(remeasure);
                }

                // Kills lag & bracket match box artifacts
                editor.updateOptions({
                  matchBrackets: "never",
                  renderControlCharacters: false,
                  renderLineHighlight: "line",
                  selectionHighlight: false,
                  occurrencesHighlight: "off",
                  overviewRulerLanes: 0,
                  hideCursorInOverviewRuler: true,
                  letterSpacing: 0,
                  fontLigatures: false,
                  cursorSmoothCaretAnimation: "off",
                });
              }}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', Consolas, 'Courier New', monospace",
                letterSpacing: 0,
                fontLigatures: false,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
                readOnly: false,
                domReadOnly: false,
                cursorStyle: "line",
                cursorBlinking: "blink",
                cursorSmoothCaretAnimation: "off",
                matchBrackets: "never",
                renderControlCharacters: false,
                renderLineHighlight: "line",
                selectionHighlight: false,
                occurrencesHighlight: "off",
                overviewRulerLanes: 0,
                hideCursorInOverviewRuler: true,
                renderWhitespace: "none",
                bracketPairColorization: { enabled: false },
              }}
            />
          </div>

          {/* DUAL TERMINAL */}
          <div style={{ height: "230px", backgroundColor: "#121215", borderTop: "1px solid #27272a", display: "flex", flexDirection: "column" }}>
            
            <div style={{ height: "36px", backgroundColor: "#18181b", borderBottom: "1px solid #27272a", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
              <div style={{ display: "flex", gap: "4px" }}>
                <button
                  onClick={() => setActiveTab("output")}
                  style={{ backgroundColor: activeTab === "output" ? "#121215" : "transparent", border: "1px solid", borderColor: activeTab === "output" ? "#27272a" : "transparent", borderBottom: activeTab === "output" ? "none" : "transparent", color: activeTab === "output" ? "#ffffff" : "#a1a1aa", padding: "4px 12px", borderRadius: "6px 6px 0 0", fontSize: "12px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <TerminalIcon size={14} color="#ffffff" /> Output Terminal & Scorecard
                </button>

                <button
                  onClick={() => setActiveTab("stdin")}
                  style={{ backgroundColor: activeTab === "stdin" ? "#121215" : "transparent", border: "1px solid", borderColor: activeTab === "stdin" ? "#27272a" : "transparent", borderBottom: activeTab === "stdin" ? "none" : "transparent", color: activeTab === "stdin" ? "#ffffff" : "#a1a1aa", padding: "4px 12px", borderRadius: "6px 6px 0 0", fontSize: "12px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <MessageSquare size={14} color="#a1a1aa" /> Custom Stdin Input
                </button>
              </div>

              <div style={{ fontSize: "11px", color: "#a1a1aa" }}>
                {problem ? "LeetCode Execution Engine" : "Docker Execution Console"}
              </div>
            </div>

            <div style={{ flex: 1, padding: "14px 18px", overflowY: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", lineHeight: "1.6", color: "#ffffff" }}>
              {activeTab === "output" ? (
                <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                  {output || "Output will appear here after clicking Run Code or Submit Solution..."}
                </pre>
              ) : (
                <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <label style={{ display: "block", fontSize: "11px", color: "#a1a1aa", marginBottom: "6px", fontWeight: "bold" }}>
                    ENTER CUSTOM STDIN PROGRAM INPUT (ONE INPUT PER LINE):
                  </label>
                  <textarea
                    value={stdinInput}
                    onChange={(e) => setStdinInput(e.target.value)}
                    placeholder="e.g. 5 10&#10;hello world"
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
              <Bot size={18} color="#ffffff" /> Gemini AI Tutor
            </h3>
            <button onClick={() => setAiDrawerOpen(false)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}>
              ✕
            </button>
          </div>

          {/* 2-Option Tabs: Hints & Complexity Analysis */}
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
                backgroundColor: aiMode === "hints" ? "#ffffff" : "#121215",
                color: aiMode === "hints" ? "#09090b" : "#a1a1aa",
                border: aiMode === "hints" ? "none" : "1px solid #27272a",
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
                backgroundColor: aiMode === "analysis" ? "#ffffff" : "#121215",
                color: aiMode === "analysis" ? "#09090b" : "#a1a1aa",
                border: aiMode === "analysis" ? "none" : "1px solid #27272a",
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
                <span>{aiMode === "hints" ? "Analyzing problem & formulating hints..." : "Evaluating Big-O time & space complexity of your code..."}</span>
              </div>
            ) : (
              <div className="markdown-body" style={{ color: "#ffffff" }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiAnalysis}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}