// backend/routes/run.js
const express = require("express");
const router = express.Router();
const { executionQueue } = require("../../queue");

router.post("/run", async (req, res) => {
  const { language, code, stdin, roomId } = req.body;

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
    // Add job to BullMQ Queue (Producer)
    const job = await executionQueue.add("execute-script", {
      language,
      code,
      stdin,
      roomId,
      timestamp: Date.now(),
    });

    // Return non-blocking 202 Accepted response immediately (<5ms)
    res.status(202).json({
      status: "queued",
      jobId: job.id,
      message: "Code execution job queued successfully.",
    });
  } catch (err) {
    console.error("Queue Push Error:", err.message);
    res.status(500).json({ error: "Failed to queue code execution task." });
  }
});

module.exports = router;
