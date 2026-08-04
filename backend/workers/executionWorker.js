// backend/workers/executionWorker.js
const { Worker } = require("bullmq");
const Redis = require("ioredis");
const { runCode } = require("../src/services/dockerService");
const redisConnection = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

// Function to attach Socket.io instance to the worker for real-time result broadcasting
function initExecutionWorker(io) {
  const worker = new Worker(
    "code-execution",
    async (job) => {
      console.log(
        `⏳ [Worker] Processing Job ID: ${job.id} (${job.data.language})`,
      );

      const { language, code, stdin, roomId } = job.data;

      // Execute code safely inside Docker container
      const result = await runCode({ language, code, stdin });

      // Broadcast execution results back via Socket.io to the room
      if (io && roomId) {
        io.to(roomId).emit("execution-result", {
          jobId: job.id,
          output: result.output || result.stdout,
          error: result.error || result.stderr,
        });
      }

      return result;
    },
    { connection: redisConnection, concurrency: 5 }, // Processes up to 5 Docker runs in parallel
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
