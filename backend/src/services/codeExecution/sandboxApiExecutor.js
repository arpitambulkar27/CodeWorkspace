const axios = require("axios");

// Free, no-card-required code execution via SandboxAPI (RapidAPI).
// Sign up: https://rapidapi.com/sandboxapidev/api/sandboxapi -> "Basic" plan
// (free forever, 500 executions/month, no credit card). Docs: https://sandboxapi.dev/docs
const SANDBOXAPI_HOST = process.env.SANDBOXAPI_RAPIDAPI_HOST || "sandboxapi.p.rapidapi.com";
const SANDBOXAPI_BASE_URL = `https://${SANDBOXAPI_HOST}`;

// Map this app's internal language keys to SandboxAPI's language IDs.
const LANGUAGE_IDS = {
  python: "python3",
  javascript: "javascript",
  cpp: "cpp",
  java: "java",
};

function sandboxApiHeaders() {
  const apiKey = process.env.SANDBOXAPI_RAPIDAPI_KEY;
  if (!apiKey) {
    throw new Error(
      "SANDBOXAPI_RAPIDAPI_KEY is not set. Get a free key (no card) at https://rapidapi.com/sandboxapidev/api/sandboxapi and add it to backend/.env."
    );
  }
  return {
    "content-type": "application/json",
    "X-RapidAPI-Key": apiKey,
    "X-RapidAPI-Host": SANDBOXAPI_HOST,
  };
}

async function runCode({ language, code, stdin = "" }) {
  const languageId = LANGUAGE_IDS[language];
  if (!languageId) {
    return { error: `Unsupported language for SandboxAPI execution: "${language}".` };
  }

  try {
    const { data } = await axios.post(
      `${SANDBOXAPI_BASE_URL}/v1/execute`,
      {
        language: languageId,
        code: code || "",
        stdin: stdin || "",
        timeout: 10, // seconds; Basic plan caps at 30s
      },
      { headers: sandboxApiHeaders(), timeout: 15000 }
    );

    if (data.status === "timeout") {
      return { error: "Time Limit Exceeded: Execution took too long." };
    }

    return {
      stdout: data.stdout || "",
      stderr: data.stderr || "",
      output: data.stdout || data.stderr || "",
    };
  } catch (err) {
    const status = err.response?.status;
    if (status === 429) {
      return { error: "SandboxAPI free-tier monthly quota (500 executions) reached. It resets on the 1st, or upgrade tiers." };
    }
    if (status === 401 || status === 403) {
      return { error: "SandboxAPI authentication failed — check SANDBOXAPI_RAPIDAPI_KEY in backend/.env." };
    }
    return { error: err.response?.data?.error || err.message || "Failed to reach SandboxAPI execution service." };
  }
}

module.exports = { runCode };
