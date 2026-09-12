const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// 1. FASTEST CONTAINER IMAGES
const DOCKER_IMAGES = {
  python: "python:3.10-slim",
  javascript: "node:18-alpine",
  cpp: "gcc:latest",
  java: "amazoncorretto:21-alpine", //  Starts ~60% faster than temurin/openjdk
};

// 2. RUN COMMANDS
const RUN_COMMANDS = {
  python: "python3 main.py",
  javascript: "node main.js",
  cpp: "g++ -O2 main.cpp -o main && ./main",
  java: "java Main.java", //  Single-pass in-memory execution (No javac overhead)
};

// 3. FILE NAMES
const FILE_NAMES = {
  python: "main.py",
  javascript: "main.js",
  cpp: "main.cpp",
  java: "Main.java",
};

async function runCode({ language, code, stdin = "" }) {
  return new Promise((resolve) => {
    const jobId = crypto.randomBytes(8).toString("hex");
    const tempDir = path.join(__dirname, `../../temp/${jobId}`);

    fs.mkdirSync(tempDir, { recursive: true });

    const codeFile = path.join(tempDir, FILE_NAMES[language] || "main.txt");
    const inputFile = path.join(tempDir, "input.txt");

    fs.writeFileSync(codeFile, code || "");
    fs.writeFileSync(inputFile, stdin || "");

    const imageName = DOCKER_IMAGES[language];
    const runCmd = RUN_COMMANDS[language];

    // Give Java 1 CPU & 256M Memory; Keep 0.5 CPU & 128M for fast runtimes
    const isJava = language === "java";
    const memory = isJava ? "256m" : "128m";
    const cpus = isJava ? "1.0" : "0.5";
    const executionTimeout = isJava ? 10000 : 8000;

    const containerName = `cf_${jobId}`;
    const dockerCmd = `docker run --name "${containerName}" --stop-timeout 5 --rm -i --network="none" --pids-limit=64 --security-opt no-new-privileges --memory="${memory}" --cpus="${cpus}" -v "${tempDir}:/app" -w /app ${imageName} sh -c "${runCmd} < input.txt"`;

    exec(dockerCmd, { timeout: executionTimeout }, (error, stdout, stderr) => {
      // Clean up temporary host directory
      fs.rm(tempDir, { recursive: true, force: true }, () => {});

      if (error && error.killed) {
        // Force kill container in Docker daemon to prevent orphan background processes
        exec(`docker rm -f ${containerName}`, () => {});
        return resolve({
          error: `Time Limit Exceeded: Execution took longer than ${executionTimeout / 1000} seconds.`,
        });
      }

      resolve({
        stdout: stdout || "",
        stderr: stderr || (error ? error.message : ""),
        output: stdout || stderr || "",
      });
    });
  });
}

module.exports = { runCode };
