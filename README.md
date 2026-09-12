# CodeFlow 🛠️⚡

CodeFlow is a production-grade, cloud-native collaborative developer workspace. It combines an in-browser IDE with safe multi-language execution inside Docker containers, real-time multiplayer editing via WebSockets, an asynchronous Redis/BullMQ task queue, and AI-powered code reviews using Google Gemini.

### ✨ Key Features
- **🔒 Sandboxed Code Execution:** Secure, ephemeral execution in isolated Docker containers with strict CPU/RAM limits for Python, JavaScript, Java, and C++.
- **⚡ Asynchronous Queue Architecture:** Non-blocking job processing using Redis and BullMQ to handle heavy container workloads smoothly.
- **👥 Live Multiplayer Collaboration:** Real-time pair programming with synchronized editor buffers and dynamic room support via Socket.io.
- **🤖 Built-in AI Code Reviewer:** Automated bug detection, Big-O complexity analysis , and clean code refactoring powered by Google Gemini API.
- **💻 Modern SaaS UI:** Built with React, Monaco Editor (VS Code engine), Lucide Icons, and custom dark/light themes.

### 🛠️ Tech Stack
- **Frontend:** React, Monaco Editor, React Router, Socket.io-client, Lucide Icons
- **Backend:** Node.js, Express.js, WebSockets (Socket.io), Docker Engine
- **Queue & Caching:** Redis, BullMQ
- **AI Engine:** Google Gemini API (`@google/genai`)
