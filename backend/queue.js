// backend/queue.js
const { Queue } = require("bullmq");
const Redis = require("ioredis");

// 1. Configure Redis Connection
const redisConnection = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null, // Required by BullMQ
});

redisConnection.on("connect", () => {
  console.log("⚡ Connected to Redis instance");
});

redisConnection.on("error", (err) => {
  console.error("❌ Redis Connection Error:", err.message);
});

// 2. Initialize BullMQ Queue for Code Executions
const executionQueue = new Queue("code-execution", {
  connection: redisConnection,
});

module.exports = { executionQueue, redisConnection };
