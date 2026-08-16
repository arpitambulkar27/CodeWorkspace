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

// @route   POST /api/workspaces
// @desc    Create a new workspace
router.post("/", protect, async (req, res) => {
  try {
    const { title, language = "javascript" } = req.body;
    const initialCode =
      DEFAULT_BOILERPLATES[language] || DEFAULT_BOILERPLATES.javascript;

    const workspace = await Workspace.create({
      userId: req.user._id,
      title: title?.trim() || "Untitled Project",
      language,
      code: initialCode,
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
// @desc    Get a single workspace by ID (owner only)
router.get("/:id", protect, async (req, res) => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      userId: req.user._id,
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
// @desc    Save/update workspace code, title, or language
router.put("/:id", protect, async (req, res) => {
  try {
    const { title, code, language, customInput } = req.body;

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
    if (customInput !== undefined) workspace.customInput = customInput;

    const updatedWorkspace = await workspace.save();
    res.json(updatedWorkspace);
  } catch (error) {
    console.error("Update Workspace Error:", error.message);
    res.status(500).json({ error: "Failed to save workspace." });
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
