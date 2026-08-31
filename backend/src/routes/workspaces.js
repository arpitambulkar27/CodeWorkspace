const express = require("express");
const router = express.Router();
const Workspace = require("../models/Workspace");
const { protect } = require("../middleware/authMiddleware");

// Default starter boilerplate per language
const DEFAULT_BOILERPLATES = {
  javascript:
    '// Write your JavaScript code here\nconsole.log("Hello, CodeForge!");',
  python: '# Write your Python code here\nprint("Hello, CodeForge!")',
  java: '// Write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CodeForge!");\n    }\n}',
  cpp: '// Write your C++ code here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, CodeForge!" << endl;\n    return 0;\n}',
};

// Default file extension per language
const DEFAULT_MAIN_FILES = {
  javascript: "main.js",
  python: "main.py",
  java: "Main.java",
  cpp: "main.cpp",
};

// @route   POST /api/workspaces
// @desc    Create a new workspace
router.post("/", protect, async (req, res) => {
  try {
    const { title, language = "javascript", code, files, customInput } = req.body;
    const initialCode =
      code || DEFAULT_BOILERPLATES[language] || DEFAULT_BOILERPLATES.javascript;

    const mainFileName = DEFAULT_MAIN_FILES[language] || "main.txt";

    const initialFiles = Array.isArray(files) && files.length > 0
      ? files
      : [
          {
            id: `file-main-${Date.now()}`,
            name: mainFileName,
            type: "file",
            parentId: null,
            content: initialCode,
            language,
          },
        ];

    const workspace = await Workspace.create({
      userId: req.user._id,
      title: title?.trim() || "Untitled Workspace",
      language,
      code: initialCode,
      files: initialFiles,
      customInput: customInput || "",
    });

    res.status(201).json(workspace);
  } catch (error) {
    console.error("Create Workspace Error:", error.message);
    res.status(500).json({ error: "Failed to create workspace." });
  }
});

// @route   GET /api/workspaces
// @desc    Get all workspaces owned by the logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const workspaces = await Workspace.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select("-__v");

    res.json(workspaces);
  } catch (error) {
    console.error("Fetch Workspaces Error:", error.message);
    res.status(500).json({ error: "Failed to fetch workspaces." });
  }
});

// @route   GET /api/workspaces/:id
// @desc    Get a single workspace by ID (owner only or public)
router.get("/:id", protect, async (req, res) => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      $or: [{ userId: req.user._id }, { isPublic: true }],
    });

    if (!workspace) {
      return res
        .status(404)
        .json({ error: "Workspace not found or unauthorized." });
    }

    res.json(workspace);
  } catch (error) {
    console.error("Get Single Workspace Error:", error.message);
    res.status(500).json({ error: "Failed to load workspace." });
  }
});

// @route   PUT /api/workspaces/:id
// @desc    Save/update workspace code, title, language, files, customInput, or isPublic
router.put("/:id", protect, async (req, res) => {
  try {
    const { title, code, language, files, customInput, isPublic } = req.body;

    const workspace = await Workspace.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!workspace) {
      return res
        .status(404)
        .json({ error: "Workspace not found or unauthorized." });
    }

    if (title !== undefined) workspace.title = title;
    if (code !== undefined) workspace.code = code;
    if (language !== undefined) workspace.language = language;
    if (files !== undefined) workspace.files = files;
    if (customInput !== undefined) workspace.customInput = customInput;
    if (isPublic !== undefined) workspace.isPublic = isPublic;

    const updatedWorkspace = await workspace.save();
    res.json(updatedWorkspace);
  } catch (error) {
    console.error("Update Workspace Error:", error.message);
    res.status(500).json({ error: "Failed to save workspace." });
  }
});

// @route   POST /api/workspaces/:id/fork
// @desc    Fork an existing workspace into a new user sandbox
router.post("/:id/fork", protect, async (req, res) => {
  try {
    const original = await Workspace.findById(req.params.id);
    if (!original) {
      return res.status(404).json({ error: "Workspace not found to fork." });
    }

    const forkedWorkspace = await Workspace.create({
      userId: req.user._id,
      title: `${original.title} (Fork)`,
      language: original.language,
      code: original.code,
      files: original.files && original.files.length > 0 ? original.files : [],
      customInput: original.customInput,
      isPublic: false,
    });

    res.status(201).json(forkedWorkspace);
  } catch (error) {
    console.error("Fork Workspace Error:", error.message);
    res.status(500).json({ error: "Failed to fork workspace." });
  }
});

// @route   DELETE /api/workspaces/:id
// @desc    Delete a workspace
router.delete("/:id", protect, async (req, res) => {
  try {
    const workspace = await Workspace.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!workspace) {
      return res
        .status(404)
        .json({ error: "Workspace not found or unauthorized." });
    }

    res.json({ message: "Workspace deleted successfully.", id: req.params.id });
  } catch (error) {
    console.error("Delete Workspace Error:", error.message);
    res.status(500).json({ error: "Failed to delete workspace." });
  }
});

module.exports = router;
