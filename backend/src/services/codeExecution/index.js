// Code execution strategy switch.
//
// The rest of the app (run.js, problems.js submit route) just calls runCode({ language, code, stdin })
// from this file and never needs to know which engine actually ran the code. Which engine gets used
// is controlled entirely by the CODE_EXECUTION_PROVIDER env var:
//
//   CODE_EXECUTION_PROVIDER=docker      -> dockerExecutor.js     (spawns real Docker containers via
//                                          `docker run`; requires a host with Docker installed, e.g.
//                                          an Oracle Cloud / DigitalOcean / EC2 VPS)
//   CODE_EXECUTION_PROVIDER=sandboxapi  -> sandboxApiExecutor.js (calls the free SandboxAPI on
//                                          RapidAPI — 500 free executions/month, no credit card
//                                          required; works on Railway/Render where Docker isn't
//                                          available)
//
// Defaults to "docker" so existing deployments (and the deploy.sh script) keep working unchanged
// if the env var isn't set. dockerExecutor.js is untouched by this refactor — it's the exact same
// logic that used to live in services/dockerService.js, just moved into this folder.
const provider = (process.env.CODE_EXECUTION_PROVIDER || "docker").toLowerCase();

const executor = provider === "sandboxapi" ? require("./sandboxApiExecutor") : require("./dockerExecutor");

if (!["docker", "sandboxapi"].includes(provider)) {
  console.warn(
    `[codeExecution] Unrecognized CODE_EXECUTION_PROVIDER="${provider}", falling back to "docker".`
  );
}

module.exports = executor;
