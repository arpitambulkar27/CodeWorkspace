// backend/src/index.js
const path = require("path");
// Explicitly resolve .env path relative to this file's folder
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// Debug log to verify key detection on startup
console.log(
  "🔑 Gemini API Key Status:",
  process.env.GEMINI_API_KEY ? "Loaded ✅" : "MISSING ❌",
);

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// Import Worker & Routes
const { initExecutionWorker } = require("../workers/executionWorker");
const runRoutes = require("./routes/run");
const aiRoutes = require("./routes/ai");

const app = express();
const server = http.createServer(app);

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Health Endpoint
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Mount REST Routes
app.use("/api", runRoutes);
app.use("/api/ai", aiRoutes);

// Initialize Socket.io Instance
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Socket.io Room & Collaboration Handlers
io.on("connection", (socket) => {
  console.log(`🔌 [Socket.io] Client connected: ${socket.id}`);

  socket.on("join-room", ({ roomId, username }) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined", { username, socketId: socket.id });
    console.log(
      `👥 [Socket.io] User ${username} (${socket.id}) joined room: ${roomId}`,
    );
  });

  socket.on("code-change", ({ roomId, code }) => {
    socket.to(roomId).emit("code-update", code);
  });

  socket.on("disconnect", () => {
    console.log(`🔌 [Socket.id] Client disconnected: ${socket.id}`);
  });
});

// INITIALIZE WORKER HERE (After 'io' is created)
initExecutionWorker(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 CodeForge backend running on http://localhost:${PORT}`);
});
