# English Pronunciation Practice Loop (`opensource/practice-app/`)

An automated English pronunciation practice loop powered by local AI microservices.

## Features
- **Looping Workflow**: Practice sentence $\rightarrow$ Native TTS $\rightarrow$ User Speech Recording $\rightarrow$ Whisper Transcription $\rightarrow$ Qwen 2.5 LLM Evaluation $\rightarrow$ Retry or Advance.
- **Microservices Integrated**:
  - **Ollama (`qwen2.5:3b`)** on port `11434`: Sentence generation with 40+ everyday random topics & pronunciation evaluation.
  - **Kokoro-82M TTS** on port `8880`: US/UK high-fidelity speech synthesis with in-memory audio caching.
  - **Faster-Whisper** on port `8000`: Strict acoustic speech-to-text (`temperature: 0.0`).
- **Dynamic Recording Duration**: Automatically measures the precise duration of the synthesized TTS audio and adds the configurable `Timer` buffer (e.g. 10s audio + 5s buffer = 15s recording window), eliminating arbitrary hardcoded limits.
- **Configurable Speech Synthesis**:
  - **TTS Voice Selector**: Choose between multiple US and UK native voices (`af_heart`, `af_bella`, `am_adam`, `bf_emma`, etc.).
  - **TTS Speed Slider**: Fine-tune speech rate from `0.5x` up to `1.5x`.
- **Integrated Audio Synthesis**: Dynamic start beeps, retry tones, and success chimes generated in-browser via Web Audio API.
- **Fail-Safe Caching**: Automatically replays native TTS audio guide if 3 consecutive pronunciation attempts miss.

---

## Quick Start

### 1. Ensure Microservices are Running
From their respective directories in `opensource/`:
- `ollama-qwen2-5`: `npm start`
- `tts-kokoro`: `npm start`
- `faster-whisper`: `npm start`

### 2. Start the Practice App
```bash
cd opensource/practice-app
npm start
```
Open **`http://localhost:3000`** in your browser.

### 3. Stop the Practice App
```bash
npm run stop
```
