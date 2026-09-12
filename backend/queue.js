// backend/queue.js
const { Queue } = require("bullmq");
const Redis = require("ioredis");

// 1. Configure Redis Connection
const redisOptions = {
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
  retryStrategy(times) {
    if (!process.env.REDIS_URL && !process.env.REDIS_HOST && times > 3) {
      return null;
    }
    return Math.min(times * 1000, 3000);
  },
};

const redisConnection = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, redisOptions)
  : new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: process.env.REDIS_PORT || 6379,
      ...redisOptions,
    });

redisConnection.on("connect", () => {
  console.log("⚡ Connected to Redis instance");
});

redisConnection.on("error", (err) => {
  if (err.code === "ECONNREFUSED") return;
  console.error("❌ Redis Connection Error:", err.message);
});

// 2. Initialize BullMQ Queue for Code Executions
const executionQueue = new Queue("code-execution", {
  connection: redisConnection,
});

module.exports = { executionQueue, redisConnection };
