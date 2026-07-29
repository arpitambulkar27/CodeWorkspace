const Docker = require("dockerode");
const fs = require("fs/promises");
const path = require("path");
const os = require("os");
const { v4: uuidv4 } = require("uuid");
const { getLanguageConfig } = require("../languages/config");

const docker = new Docker(); // connects to local Docker daemon via socket

// Hard limits — these are what actually make this "secure" execution.
// Without these, any submitted code could fork-bomb, allocate infinite
// memory, or hang forever and take the whole host down with it.
const LIMITS = {
  memoryBytes: 128 * 1024 * 1024, // 128 MB
  cpuQuota: 50000,                // ~0.5 of a CPU core (cpuQuota/cpuPeriod)
  cpuPeriod: 100000,
  pidsLimit: 64,                  // stop fork bombs
  timeoutMs: 8000,                // wall-clock kill switch
  maxOutputBytes: 64 * 1024,      // truncate runaway output
};

/**
 * Runs untrusted user code inside a locked-down, single-use Docker container.
 *
 * @param {Object} opts
 * @param {string} opts.language - "python" | "javascript" | "java"
 * @param {string} opts.code - the source code to execute
 * @param {string} [opts.stdin] - optional input fed to the program
 * @returns {Promise<{stdout: string, stderr: string, exitCode: number|null, timedOut: boolean, durationMs: number}>}
 */
async function runCode({ language, code, stdin = "" }) {
  const config = getLanguageConfig(language);
  const jobId = uuidv4();
  const hostDir = path.join(os.tmpdir(), "codeforge-jobs", jobId);

  await fs.mkdir(hostDir, { recursive: true });
  await fs.writeFile(path.join(hostDir, config.filename), code, "utf8");
  if (stdin) {
    await fs.writeFile(path.join(hostDir, "stdin.txt"), stdin, "utf8");
  }

  const startedAt = Date.now();
  let container;
  let timedOut = false;

  try {
    container = await docker.createContainer({
      Image: config.image,
      Cmd: ["sh", "-c", buildRunCommand(config, stdin)],
      WorkingDir: "/sandbox",
      HostConfig: {
        Binds: [`${hostDir}:/sandbox`],
        Memory: LIMITS.memoryBytes,
        MemorySwap: LIMITS.memoryBytes, // disable swap beyond the memory limit
        CpuQuota: LIMITS.cpuQuota,
        CpuPeriod: LIMITS.cpuPeriod,
        PidsLimit: LIMITS.pidsLimit,
        NetworkMode: "none",           // no internet access from user code
        ReadonlyRootfs: false,         // some runtimes need to write temp files
        AutoRemove: false,             // we remove manually after reading logs
        SecurityOpt: ["no-new-privileges"],
      },
      Tty: false,
      AttachStdout: true,
      AttachStderr: true,
      User: "1000:1000",              // never run submitted code as root
    });

    await container.start();

    const result = await Promise.race([
      waitForContainer(container),
      timeout(LIMITS.timeoutMs).then(() => "TIMEOUT"),
    ]);

    if (result === "TIMEOUT") {
      timedOut = true;
      await safeKill(container);
    }

    const logs = await container.logs({ stdout: true, stderr: true, timestamps: false });
    const { stdout, stderr } = demuxLogs(logs);

    let inspectData = null;
    try {
      inspectData = await container.inspect();
    } catch (_) {
      /* container may already be gone if it auto-exited */
    }

    return {
      stdout: truncate(stdout),
      stderr: timedOut
        ? truncate(stderr) + "\n[Killed: execution exceeded time limit]"
        : truncate(stderr),
      exitCode: timedOut ? null : inspectData?.State?.ExitCode ?? null,
      timedOut,
      durationMs: Date.now() - startedAt,
    };
  } finally {
    if (container) {
      try {
        await container.remove({ force: true });
      } catch (_) {
        /* already removed */
      }
    }
    await fs.rm(hostDir, { recursive: true, force: true });
  }
}

function buildRunCommand(config, stdin) {
  // Feed stdin.txt in if provided, otherwise run normally
  const redirect = stdin ? " < stdin.txt" : "";
  return `${config.cmd}${redirect}`;
}

function waitForContainer(container) {
  return container.wait().then(() => "EXITED");
}

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeKill(container) {
  try {
    await container.kill();
  } catch (_) {
    /* already dead */
  }
}

function truncate(str) {
  if (Buffer.byteLength(str, "utf8") <= LIMITS.maxOutputBytes) return str;
  return str.slice(0, LIMITS.maxOutputBytes) + "\n[output truncated]";
}

// Docker multiplexes stdout/stderr into one binary stream when Tty: false.
// Each frame has an 8-byte header: [stream_type, 0, 0, 0, size(4 bytes BE)]
function demuxLogs(buffer) {
  let stdout = "";
  let stderr = "";
  let offset = 0;

  while (offset < buffer.length) {
    const header = buffer.slice(offset, offset + 8);
    if (header.length < 8) break;
    const streamType = header[0]; // 1 = stdout, 2 = stderr
    const size = header.readUInt32BE(4);
    const payload = buffer.slice(offset + 8, offset + 8 + size).toString("utf8");

    if (streamType === 2) stderr += payload;
    else stdout += payload;

    offset += 8 + size;
  }

  return { stdout, stderr };
}

module.exports = { runCode, LIMITS };
