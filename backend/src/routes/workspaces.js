const express = require("express");
const router = express.Router();
const Workspace = require("../models/Workspace");
const { protect } = require("../middleware/authMiddleware");
const { validateBody, workspaceSchemas } = require("../middleware/schemaValidation");

// @route   POST /api/workspaces
// @desc    Create a new workspace (Root folder + default starter file)
router.post("/", protect, validateBody(workspaceSchemas.create), async (req, res) => {
  try {
    const { title, language = "python", customInput } = req.body;
    const folderName = title?.trim() || "src";
    const rootFolderId = `folder-root-${Date.now()}`;

    const defaultFileNames = {
      python: "main.py",
      javascript: "index.js",
      java: "Main.java",
      cpp: "main.cpp",
    };

    const defaultBoilerplates = {
      python: `# Python 3 Starter Code\nprint("Hello, CodeFlow!")\n`,
      javascript: `// JavaScript Starter Code\nconsole.log("Hello, CodeFlow!");\n`,
      java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CodeFlow!");\n    }\n}\n`,
      cpp: `#include <iostream>\n\nint main() {\n    std::cout << "Hello, CodeFlow!" << std::endl;\n    return 0;\n}\n`,
    };

    const mainFileName = defaultFileNames[language] || "main.py";
    const mainFileContent = defaultBoilerplates[language] || defaultBoilerplates.python;

    const initialFiles = [
      {
        id: rootFolderId,
        name: folderName,
        type: "folder",
        parentId: null,
      },
      {
        id: `file-main-${Date.now()}`,
        name: mainFileName,
        type: "file",
        parentId: rootFolderId,
        content: mainFileContent,
        language: language,
      },
    ];

    const workspace = await Workspace.create({
      userId: req.user._id,
      title: title?.trim() || "Untitled Workspace",
      language,
      code: mainFileContent,
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
router.put("/:id", protect, validateBody(workspaceSchemas.update), async (req, res) => {
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

    // Security check: Only allow forking if workspace is public or owned by user
    if (!original.isPublic && original.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized: Cannot fork a private workspace." });
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
