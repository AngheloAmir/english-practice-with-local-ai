import { Router, Request, Response } from "express";
import type { FasterWhisperSTTBody } from "types";

const sttRouter = Router();
const WHISPER_HOST = process.env.WHISPER_HOST || "http://localhost:8000";

/*
================================================================================
Client Example: Record Microphone in Browser & Transcribe (Returns string)
================================================================================
// 1. Start persistent microphone stream & record audio
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const mediaRecorder = new MediaRecorder(stream);
const audioChunks: Blob[] = [];

mediaRecorder.ondataavailable = (e) => {
  if (e.data.size > 0) audioChunks.push(e.data);
};

mediaRecorder.start();

// ... When user finishes speaking ...
mediaRecorder.stop();

mediaRecorder.onstop = async () => {
  const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

  // Convert Blob to Base64
  const reader = new FileReader();
  reader.readAsDataURL(audioBlob);
  reader.onloadend = async () => {
    const base64Audio = reader.result as string;

    // 2. Send to /service/stt
    const response = await fetch("http://localhost:3500/service/stt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "Systran/faster-whisper-base",
        language: "en",
        temperature: 0.0, // 0.0 = Strict acoustic (no hallucination/guessing)
        audio: base64Audio
      })
    });

    const transcript = await response.text();
    console.log("Transcribed Text:", transcript);
  };
};
================================================================================
*/
const handleSTT = async (req: Request, res: Response) => {
    try {
        const contentType = req.headers["content-type"] || "";

        let formData: FormData;

        // Case 1: Client sent JSON body with base64 audio
        if (contentType.includes("application/json")) {
            const body = (req.body || {}) as FasterWhisperSTTBody;
            const model = body.model || "Systran/faster-whisper-base";
            const language = body.language || "en";
            const temperature = typeof body.temperature === "number" ? body.temperature : 0.0;

            if (!body.audio) {
                res.status(400).json({ error: "Missing 'audio' field in JSON request" });
                return;
            }

            // Extract base64 content
            let base64Data = typeof body.audio === "string" ? body.audio : "";
            if (base64Data.includes(",")) {
                base64Data = base64Data.split(",")[1];
            }

            const audioBuffer = Buffer.from(base64Data, "base64");
            const audioBlob = new Blob([audioBuffer], { type: "audio/wav" });

            formData = new FormData();
            formData.append("file", audioBlob, "audio.wav");
            formData.append("model", model);
            formData.append("language", language);
            formData.append("temperature", String(temperature));
            formData.append("response_format", "text");
        } 
        // Case 2: Client sent direct binary / multipart or other formats
        else {
            // Forward raw body or stream if received as buffer
            const rawBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || "");
            const audioBlob = new Blob([rawBuffer], { type: contentType || "audio/wav" });

            formData = new FormData();
            formData.append("file", audioBlob, "audio.wav");
            formData.append("model", (req.query.model as string) || "Systran/faster-whisper-base");
            formData.append("language", (req.query.language as string) || "en");
            formData.append("temperature", (req.query.temperature as string) || "0.0");
            formData.append("response_format", "text");
        }

        const whisperRes = await fetch(`${WHISPER_HOST}/v1/audio/transcriptions`, {
            method: "POST",
            body: formData,
        });

        if (!whisperRes.ok) {
            const errText = await whisperRes.text().catch(() => "Whisper transcription failed");
            res.status(whisperRes.status || 500).json({ error: errText });
            return;
        }

        const transcriptText = await whisperRes.text();

        // Return purely the string of the response as text/plain
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.send(transcriptText.trim());
    } catch (err: any) {
        console.error("STT error:", err);
        if (!res.headersSent) {
            res.status(500).json({ error: err?.message || "Internal server error" });
        } else {
            res.end();
        }
    }
};

sttRouter.all("/", handleSTT);

export default sttRouter;
