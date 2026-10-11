# Local AI Microservices (`opensource/`)

This directory houses the standalone, zero-config local AI engines that power the English communication and pronunciation platform.

Each service operates as an independent Docker container with a Node.js orchestrator (`server.js`) that auto-detects hardware and serves a dedicated **testing playground + live `fetch()` code generator**.

---

## 🛠️ Microservices Overview

| Directory | Engine | Model | Default Port | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **[`ollama-qwen2-5/`](./ollama-qwen2-5)** | Ollama | `qwen2.5:3b` | `11434` | English grammar, tense correction & structured JSON evaluation |
| **[`faster-whisper/`](./faster-whisper)** | Speaches (FastAPI) | `faster-whisper-base` | `8000` | Strict acoustic Speech-to-Text & word-level pronunciation scoring |
| **[`tts-kokoro/`](./tts-kokoro)** | Kokoro-FastAPI | `kokoro-82m` | `8880` | High-fidelity US/UK native speech synthesizer |

---

## ⚡ Quick Usage

### Start Any Service
Navigate into the respective service directory and run:
```bash
npm start
```
- Automatically verifies Docker is running.
- Auto-detects OS, CPU, RAM, and GPU.
- Spawns the Docker container in the background.
- Automatically checks and downloads the model if missing.
- Prints a clean terminal summary with the **API Port** and **Web Testbench URL**.

### Stop Any Service
```bash
npm run stop
```
- Shuts down the Docker container cleanly and releases all ports and memory.

---

## 🧪 Interactive Developer Testbenches

Every service features a clean, two-column web interface:
1. **Left Column (`Testing Area`):** Directly tests microphone input, prompts, voices, and audio playback to verify the engine is healthy.
2. **Right Column (`Backend Code & Fetch Usage`):** Real-time, auto-updating `fetch()` snippet with a **Copy Code** button ready to paste into your backend apps (`apps/serverless`) or frontend (`apps/frontend-english`).
