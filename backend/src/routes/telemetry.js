// backend/src/routes/telemetry.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Workspace = require("../models/Workspace");
const Problem = require("../models/Problem");
const { redisConnection } = require("../../queue");

// @route   GET /api/telemetry
// @desc    Get live telemetry stats for the Dashboard UI
router.get("/", async (req, res) => {
  try {
    const mongoStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
    const redisStatus = redisConnection && redisConnection.status === "ready" ? "Connected" : "Offline";

    const workspaceCount = await Workspace.countDocuments({});
    const problemCount = await Problem.countDocuments({});

    res.json({
      status: "ok",
      timestamp: new Date(),
      system: {
        nodeVersion: process.version,
        uptimeSeconds: Math.floor(process.uptime()),
        memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
      database: {
        mongoDB: mongoStatus,
        documentStore: "Document Store",
        redis: redisStatus,
        rateLimiter: "10 runs / min",
        totalWorkspaces: workspaceCount,
        totalProblems: problemCount,
      },
      monitoring: {
        prometheus: "/metrics",
        liveScraping: "GraphQL / Cheerio",
      },
      sandbox: {
        dockerCap: "128MB / 0.5 CPU",
        memoryLimit: "128 MB",
        cpuQuota: "0.5 CPU",
        timeoutLimit: "5000 ms",
        isolation: "Hardened Isolation",
        networkMode: "none (Isolated)",
        rateLimit: "10 runs / min",
      },
    });
  } catch (error) {
    console.error("Telemetry Endpoint Error:", error.message);
    res.status(500).json({ error: "Failed to fetch telemetry metrics." });
  }
});

module.exports = router;
