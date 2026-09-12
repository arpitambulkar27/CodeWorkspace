// Production PM2 Configuration for CodeFlow Backend Cluster Mode
module.exports = {
  apps: [
    {
      name: "codeflow-backend",
      script: "src/index.js",
      instances: "max",           // Scale across all CPU cores
      exec_mode: "cluster",       // Cluster mode for load balancing
      watch: false,
      max_memory_restart: "1G",   // Restart process if memory exceeds 1GB
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
  ],
};
