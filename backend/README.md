# CodeForge — Phase 1: Sandboxed Code Execution Engine

This is the core backend service: it takes code + a language, runs it inside a
locked-down, single-use Docker container, and returns stdout/stderr — safely.

## Prerequisites (install on YOUR laptop, not here)

1. **Docker Desktop** (or Docker Engine on Linux) — must be running.
   Verify with: `docker --version` and `docker ps` (should not error).
2. **Node.js 18+** — verify with `node --version`.

## Setup

```bash
cd backend
npm install
npm run build-images   # builds codeforge-python, codeforge-node, codeforge-java
                        # (takes a few minutes the first time — downloads base images)
npm start               # starts the API on http://localhost:5000
```

## Test it

```bash
# Health check
curl http://localhost:5000/health

# Run some Python
curl -X POST http://localhost:5000/api/run \
  -H "Content-Type: application/json" \
  -d '{"language":"python","code":"print(\"hello from sandbox\")"}'

# Run something that should time out (infinite loop)
curl -X POST http://localhost:5000/api/run \
  -H "Content-Type: application/json" \
  -d '{"language":"python","code":"while True: pass"}'

# Run Java
curl -X POST http://localhost:5000/api/run \
  -H "Content-Type: application/json" \
  -d '{"language":"java","code":"public class Main { public static void main(String[] a){ System.out.println(\"hi\"); } }"}'
```

Expected response shape:
```json
{
  "stdout": "hello from sandbox\n",
  "stderr": "",
  "exitCode": 0,
  "timedOut": false,
  "durationMs": 143
}
```

## How it works (you WILL be asked this in interviews — know it cold)

1. User code is written to a temp folder on the host: `/tmp/codeforge-jobs/<uuid>/main.py`.
2. That folder is bind-mounted into a **brand-new container** at `/sandbox`.
3. The container runs with hard limits so untrusted code can't hurt anything:
   - `Memory: 128MB` + `MemorySwap` capped — can't exhaust host RAM.
   - `CpuQuota/CpuPeriod` — capped to ~0.5 CPU core.
   - `PidsLimit: 64` — stops fork bombs (`while(1) fork()`).
   - `NetworkMode: none` — code can't call out to the internet or scan your network.
   - `User: 1000:1000` — never runs as root inside the container.
   - `no-new-privileges` — can't escalate privileges even if it tries.
4. A wall-clock timeout (8s) races against the container finishing. If the
   timeout wins, we forcibly `kill` the container — this is what stops
   infinite loops from hanging forever.
5. Docker interleaves stdout/stderr into one binary stream with an 8-byte
   frame header per chunk (`demuxLogs` in `dockerRunner.js` parses this —
   this is real Docker Engine API wire format, not something I invented).
6. The container is removed and the temp folder deleted — every run starts
   completely clean, no state leaks between users.

## What's NOT here yet (later phases)

- Frontend (Monaco editor + React)
- Real-time collaboration (Socket.io)
- GitHub OAuth
- AI code review
- Persistent storage of submissions (Postgres/Mongo)

## Known limitations to be upfront about in interviews

- Currently supports Python, JavaScript, Java. Adding a language = one new
  Dockerfile + one config entry.
- No queueing yet — concurrent requests each spin up their own container.
  At real scale you'd put a job queue (BullMQ/Redis) in front of this so you
  don't fork-bomb your own host with 500 simultaneous containers.
- No persistent volume caching for compiled Java classes — every run
  recompiles from scratch (fine for a student project, would optimize this
  in a "real" version).
