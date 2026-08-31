// Each language config tells the runner:
// - which Docker image to use
// - what filename to write the user's code to
// - the shell command to compile+run it inside the container

const LANGUAGES = {
  python: {
    image: process.env.DOCKER_IMAGE_PYTHON || "python:3.10-slim",
    filename: "main.py",
    cmd: "python3 main.py",
  },
  javascript: {
    image: process.env.DOCKER_IMAGE_JS || "node:18-alpine",
    filename: "main.js",
    cmd: "node main.js",
  },
  java: {
    image: process.env.DOCKER_IMAGE_JAVA || "amazoncorretto:21-alpine",
    filename: "Main.java",
    cmd: "javac Main.java && java Main",
  },
  cpp: {
    image: process.env.DOCKER_IMAGE_CPP || "gcc:latest",
    filename: "main.cpp",
    cmd: "g++ main.cpp -o main && ./main",
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
