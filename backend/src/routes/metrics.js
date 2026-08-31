// backend/src/routes/metrics.js
const express = require("express");
const router = express.Router();
const { register } = require("../services/metrics");

// @route   GET /metrics
// @desc    Expose Prometheus telemetry metrics
router.get("/", async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

module.exports = router;
