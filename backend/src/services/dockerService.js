// Kept for backward compatibility with any code still importing "../services/dockerService".
// The actual implementation now lives in services/codeExecution/dockerExecutor.js, and new
// code should import services/codeExecution (the index.js strategy switch) instead of this
// file directly, so it can also run against Judge0 when CODE_EXECUTION_PROVIDER=judge0.
module.exports = require("./codeExecution/dockerExecutor");
