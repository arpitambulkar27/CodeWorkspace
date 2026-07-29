const express = require("express");
const { runCode } = require("../runner/dockerRunner");
const { LANGUAGES } = require("../languages/config");

const router = express.Router();

// GET /api/languages -> list supported languages (for the frontend dropdown)
router.get("/languages", (req, res) => {
  res.json({ languages: Object.keys(LANGUAGES) });
});

// POST /api/run -> { language, code, stdin? }
router.post("/run", async (req, res) => {
  const { language, code, stdin } = req.body;

  if (!language || typeof code !== "string") {
    return res.status(400).json({ error: "Both 'language' and 'code' are required." });
  }
  if (code.length > 20000) {
    return res.status(400).json({ error: "Code exceeds max allowed length (20,000 chars)." });
  }

  try {
    const result = await runCode({ language, code, stdin });
    res.json(result);
  } catch (err) {
    console.error("Execution error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
