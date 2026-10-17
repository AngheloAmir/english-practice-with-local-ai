import { Router, Request, Response } from "express";
import type { KororoTTSBody } from "types";

const ttsRouter = Router();
const KOKORO_HOST = process.env.KOKORO_HOST || "http://localhost:8880";

/*
================================================================================
Client Example 1: Synthesize Single Sentence & Play Audio in Browser
================================================================================
const response = await fetch("http://localhost:3500/service/tts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    voice: "af_heart",
    text: "Welcome to your English practice session!",
    speed: 1.0,
    response_format: "mp3"
  })
});

const audioBlob = await response.blob();
const audioUrl = URL.createObjectURL(audioBlob);
const audio = new Audio(audioUrl);
await audio.play();

================================================================================
Client Example 2: Word-by-Word Pronunciation (Array Output)
================================================================================
// Returns: [ ["cat is a good pet", "data:audio/mpeg;base64,..."], ["cat", "..."], ... ]
const response = await fetch("http://localhost:3500/service/tts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    voice: "af_heart",
    text: ["cat", "is", "a", "good", "pet"],
    speed: 1.0,
    response_format: "mp3"
  })
});

const data = await response.json(); // KororoAudioTuple[]
// Play full sentence:
new Audio(data[0][1]).play();
// Play individual word (e.g., "cat"):
new Audio(data[1][1]).play();
================================================================================
*/
const handleTTS = async (req: Request, res: Response) => {
    try {
        const body: Partial<KororoTTSBody> = req.body || {};

        const voice = body.voice || "af_heart";
        const text = body.text || (typeof req.query.text === "string" ? req.query.text : "Hello! Welcome to English practice.");
        const speed = typeof body.speed === "number" ? body.speed : 1.0;
        const responseFormat = body.response_format || "mp3";

        const mimeTypes: Record<string, string> = {
            mp3: "audio/mpeg",
            wav: "audio/wav",
            opus: "audio/opus",
            flac: "audio/flac",
            aac: "audio/aac",
        };
        const mimeType = mimeTypes[responseFormat] || "audio/mpeg";

        // Helper to synthesize a single string to Base64 data URI
        const synthesizeToBase64 = async (inputStr: string): Promise<string> => {
            const resp = await fetch(`${KOKORO_HOST}/v1/audio/speech`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "kokoro",
                    input: inputStr,
                    voice,
                    speed,
                    response_format: responseFormat,
                }),
            });
            if (!resp.ok) {
                throw new Error(`Failed to synthesize "${inputStr}": ${resp.statusText}`);
            }
            const arrayBuffer = await resp.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString("base64");
            return `data:${mimeType};base64,${base64}`;
        };

        // If text is an array: synthesize full combined phrase first, then each word
        if (Array.isArray(text)) {
            const words = text.map((w) => String(w).trim()).filter(Boolean);
            const fullSentence = words.join(" ");

            // Index 0: Full phrase
            // Index 1..N: Each individual word
            const itemsToSynthesize = [fullSentence, ...words];

            const results: [string, string][] = [];
            for (const item of itemsToSynthesize) {
                const audioDataUri = await synthesizeToBase64(item);
                results.push([item, audioDataUri]);
            }

            res.setHeader("Content-Type", "application/json");
            res.json(results);
            return;
        }

        // Single string: Stream raw audio binary directly
        const kokoroPayload = {
            model: "kokoro",
            input: text,
            voice,
            speed,
            response_format: responseFormat,
        };

        const kokoroRes = await fetch(`${KOKORO_HOST}/v1/audio/speech`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(kokoroPayload),
        });

        if (!kokoroRes.ok || !kokoroRes.body) {
            const errText = await kokoroRes.text().catch(() => "Kokoro TTS request failed");
            res.status(kokoroRes.status || 500).json({ error: errText });
            return;
        }

        const contentType = kokoroRes.headers.get("content-type") || mimeType;

        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "no-cache");

        const reader = kokoroRes.body.getReader();

        req.on("close", () => {
            reader.cancel().catch(() => {});
        });

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
        }

        res.end();
    } catch (err: any) {
        console.error("TTS error:", err);
        if (!res.headersSent) {
            res.status(500).json({ error: err?.message || "Internal server error" });
        } else {
            res.end();
        }
    }
};

ttsRouter.all("/", handleTTS);

export default ttsRouter;
