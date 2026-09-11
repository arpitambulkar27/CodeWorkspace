// backend/workers/executionWorker.js
const { Worker } = require("bullmq");
const Redis = require("ioredis");
const { runCode } = require("../src/services/dockerService");

const redisConnection = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

function initExecutionWorker(io) {
  const worker = new Worker(
    "code-execution",
    async (job) => {
      console.log(
        `⏳ [Worker] Processing Job ID: ${job.id} (${job.data.language})`
      );

      const { language, code, stdin, stdinInput, roomId, roomCode } = job.data;
      const targetStdin = stdinInput !== undefined ? stdinInput : stdin;
      const targetRoom = roomCode || roomId;

      // Execute code safely inside Docker container
      const result = await runCode({ language, code, stdin: targetStdin });

      return result;
    },
    { connection: redisConnection, concurrency: 5 }
  );

  worker.on("completed", (job) => {
    console.log(`✅ [Worker] Job ID: ${job.id} completed successfully`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ [Worker] Job ID: ${job.id} failed:`, err.message);
  });

  return worker;
}

module.exports = { initExecutionWorker };
