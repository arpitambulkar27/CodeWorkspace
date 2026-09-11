const express = require("express");
const router = express.Router();
const { runCode } = require("../services/dockerService");
const { runRateLimiter } = require("../middleware/rateLimiter");
const { protect } = require("../middleware/authMiddleware");

// Apply Auth Protection & Redis Sliding-Window Rate Limiter (Max 10 runs per minute)
router.post("/run", protect, runRateLimiter, async (req, res) => {
  const { language, code, stdin, stdinInput, roomId, roomCode } = req.body;

  const targetStdin = stdinInput !== undefined ? stdinInput : stdin;
  const targetRoom = roomCode || roomId;

  // Validation checks
  if (!language || typeof code !== "string") {
    return res
      .status(400)
      .json({ error: "Both 'language' and 'code' are required." });
  }

  if (code.length > 20000) {
    return res
      .status(400)
      .json({ error: "Code exceeds max length (20,000 chars)." });
  }

  try {
    // Execute code safely inside sandboxed Docker container
    const result = await runCode({ language, code, stdin: targetStdin });

    return res.status(200).json({
      status: "completed",
      stdout: result.stdout || "",
      stderr: result.stderr || result.error || "",
      output: result.output || result.stdout || result.stderr || result.error || "Program executed with no stdout output.",
    });
  } catch (err) {
    console.error("Direct Docker Execution Error:", err);
    return res.status(500).json({ error: "Failed to execute code in Docker container." });
  }
});

module.exports = router;
