// Each language config tells the runner:
// - which Docker image to use
// - what filename to write the user's code to
// - the shell command to compile+run it inside the container
//
// Everything runs as: sh -c "<cmd>" inside /sandbox (working dir in container)

const LANGUAGES = {
  python: {
    image: "codeforge-python",
    filename: "main.py",
    cmd: "python3 main.py",
  },
  javascript: {
    image: "codeforge-node",
    filename: "main.js",
    cmd: "node main.js",
  },
  java: {
    image: "codeforge-java",
    filename: "Main.java",
    // Java needs a compile step before running
    cmd: "javac Main.java && java Main",
  },
};

function getLanguageConfig(language) {
  const config = LANGUAGES[language];
  if (!config) {
    const supported = Object.keys(LANGUAGES).join(", ");
    throw new Error(`Unsupported language: "${language}". Supported: ${supported}`);
  }
  return config;
}

module.exports = { LANGUAGES, getLanguageConfig };
