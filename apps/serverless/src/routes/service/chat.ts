import { Router, Request, Response } from "express";
import type { OllamaChatBody } from "types";

const chatRouter = Router();
const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";

/*
================================================================================
Client Example 1: Real-Time Stream Chat (Token-by-Token Plain Text)
================================================================================
const response = await fetch("http://localhost:3500/service/chat/stream", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "qwen2.5:3b",
    messages: [
      { role: "system", content: "You are a friendly English conversation tutor." },
      { role: "user", content: "Hello! Can we practice introducing ourselves?" }
    ],
    options: {
      temperature: 0.7,
      num_ctx: 2048
    }
  })
});

const reader = response.body?.getReader();
const decoder = new TextDecoder("utf-8");
let fullText = "";

if (reader) {
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    fullText += chunk;
    console.log("Chunk:", chunk); // Updates UI token-by-token
  }
}
console.log("Final Full Output:", fullText);

================================================================================
Client Example 2: Structured JSON Output (Grammar Evaluation / Scoring)
================================================================================
const response = await fetch("http://localhost:3500/service/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "qwen2.5:3b",
    messages: [
      { role: "system", content: "Score grammar based on user input sentence." },
      { role: "user", content: "what is the beggining of the our time and the key reason behind it" }
    ],
    // Force structured JSON schema
    outputformat: "{ score: number, reason: string }",
    options: {
      temperature: 0.5,
      num_ctx: 2048
    }
  })
});

const data = await response.json();
console.log("Score:", data.score);   // e.g. 5
console.log("Reason:", data.reason); // e.g. "The sentence is grammatically correct..."
================================================================================
*/
const handleChat = async (req: Request, res: Response) => {
    try {
        // Ensure CORS headers for streaming responses
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

        let body: Partial<OllamaChatBody> = {};
        if (typeof req.body === "string" && req.body.trim()) {
            try {
                body = JSON.parse(req.body);
            } catch { }
        } else if (req.body && typeof req.body === "object" && Object.keys(req.body).length > 0) {
            body = req.body;
        }


        let messages = body.messages;
        if (!messages || messages.length === 0) {
            const promptText = (body as any)?.prompt || (body as any)?.message || (body as any)?.content || (req.query?.prompt as string) || (req.query?.message as string);
            if (promptText) {
                messages = [{ role: "user", content: String(promptText) }];
            }
        }

        if (!messages || messages.length === 0) {
            res.status(400).json({ error: "Missing required 'messages' array in request body." });
            return;
        }

        const model = body.model || (req.query.model as string) || "qwen2.5:3b";

        // Auto-detect response format:
        // Stream when:
        // - Route is /stream (e.g. /service/chat/stream)
        // - output is 'text'
        // - stream is true
        // - x-stream header is 'true'
        // - Accept header includes text/plain or text/event-stream
        const isStreamRoute = req.path.endsWith("/stream") || req.baseUrl.endsWith("/stream") || req.originalUrl.includes("/service/chat/stream");
        const explicitOutput = body.output || (req.query.output as string);
        const explicitStream = body.stream ?? (req.query.stream !== undefined ? req.query.stream === "true" : undefined);
        const isStreamHeader = req.headers["x-stream"] === "true";
        const acceptsStream = req.headers.accept?.includes("text/plain") || req.headers.accept?.includes("text/event-stream");

        let shouldStream = false;

        if (isStreamRoute) {
            shouldStream = true;
        } else if (explicitOutput === "json") {
            shouldStream = false;
        } else if (explicitOutput === "text") {
            shouldStream = true;
        } else if (explicitStream !== undefined) {
            shouldStream = explicitStream;
        } else if (isStreamHeader || acceptsStream) {
            shouldStream = true;
        }

        function parseSimpleSchema(input: any): Record<string, any> | "json" {
            if (!input) return "json";
            if (typeof input === "object") return input;

            const str = String(input).trim();
            try {
                const parsed = JSON.parse(str);
                if (parsed && typeof parsed === "object") return parsed;
            } catch { }

            const braceMatch = str.match(/\{([^}]+)\}/);
            const inner = braceMatch ? braceMatch[1] : str;
            const parts = inner.split(",").map(p => p.trim()).filter(Boolean);
            const properties: Record<string, any> = {};
            const required: string[] = [];

            for (const part of parts) {
                const colonIdx = part.indexOf(":");
                if (colonIdx === -1) {
                    const nameMatch = part.match(/^([a-zA-Z0-9_]+)/);
                    if (nameMatch) {
                        const k = nameMatch[1];
                        const lower = part.toLowerCase();
                        const isNum = lower.includes("number") || lower.includes("int") || lower.includes("1 to 10") || lower.includes("score");
                        properties[k] = { type: isNum ? "number" : "string" };
                        required.push(k);
                    }
                    continue;
                }

                const rawKey = part.slice(0, colonIdx).trim();
                const rawType = part.slice(colonIdx + 1).trim().toLowerCase();
                const keyMatch = rawKey.match(/^([a-zA-Z0-9_]+)/);
                if (!keyMatch) continue;
                const key = keyMatch[1];
                required.push(key);

                if (rawType.includes("number") || rawType.includes("int") || rawKey.includes("1 to 10") || rawKey.includes("score")) {
                    properties[key] = { type: "number" };
                } else if (rawType.includes("bool")) {
                    properties[key] = { type: "boolean" };
                } else if (rawType.includes("array") || rawType.includes("[]")) {
                    properties[key] = { type: "array" };
                } else {
                    properties[key] = { type: "string" };
                }
            }

            if (Object.keys(properties).length > 0) {
                return {
                    type: "object",
                    properties,
                    required
                };
            }

            return "json";
        }

        let format: any = undefined;
        if (!shouldStream) {
            if (body.outputformat) {
                format = parseSimpleSchema(body.outputformat);
            } else {
                // Check if any message mentions "outputformat: { ... }"
                const formatPrompt = messages.find(m => /outputformat\s*:\s*\{[^}]+\}/i.test(m.content));
                if (formatPrompt) {
                    const match = formatPrompt.content.match(/outputformat\s*:\s*(\{[^}]+\})/i);
                    if (match) {
                        format = parseSimpleSchema(match[1]);
                    }
                }
            }

            if (!format) {
                format = "json";
            }
        }

        const payload: Record<string, any> = {
            model,
            messages,
            stream: shouldStream,
            options: {
                temperature: body.options?.temperature ?? 0.7,
                num_ctx: body.options?.num_ctx ?? 2048,
                ...(body.options || {})
            }
        };

        if (format) {
            payload.format = format;
        }

        const ollamaRes = await fetch(`${OLLAMA_HOST}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!ollamaRes.ok) {
            const errText = await ollamaRes.text().catch(() => "Ollama request failed");
            res.status(ollamaRes.status || 500).json({ error: errText });
            return;
        }

        // Non-streaming response: ALWAYS format as clean JSON, stripping Ollama metadata
        if (!shouldStream) {
            const raw = await ollamaRes.json();
            const rawContent = raw?.message?.content || "";
            let trimmed = rawContent.trim();

            // Strip markdown code fences if model returned ```json ... ``` or ``` ... ```
            if (trimmed.startsWith("```json")) {
                trimmed = trimmed.replace(/^```json\s*/, "").replace(/\s*```$/, "");
            } else if (trimmed.startsWith("```")) {
                trimmed = trimmed.replace(/^```\s*/, "").replace(/\s*```$/, "");
            }

            // If the content is valid JSON (e.g. { score: 10, reason: "..." }), return parsed JSON
            try {
                const parsed = JSON.parse(trimmed);
                if (parsed && typeof parsed === "object") {
                    res.json(parsed);
                    return;
                }
            } catch {
                // Not a JSON string, fallback to wrapping in { message: ... }
            }

            // Plain text content wrapped in clean JSON format
            res.json({ message: rawContent });
            return;
        }

        if (!ollamaRes.body) {
            res.status(500).json({ error: "Missing Ollama response stream body" });
            return;
        }

        // Set streaming response headers
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache, no-transform");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.flushHeaders();
        res.socket?.setNoDelay(true);

        const reader = ollamaRes.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        // Handle client disconnect
        req.on("close", () => {
            reader.cancel().catch(() => { });
        });

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                try {
                    const parsed = JSON.parse(trimmed);
                    const content = parsed?.message?.content;
                    if (content) {
                        res.write(content);
                    }
                } catch {
                    // Ignore malformed chunk lines
                }
            }
        }

        if (buffer.trim()) {
            try {
                const parsed = JSON.parse(buffer.trim());
                const content = parsed?.message?.content;
                if (content) {
                    res.write(content);
                }
            } catch { }
        }

        res.end();
    } catch (err: any) {
        console.error("Chat error:", err);
        if (!res.headersSent) {
            res.status(500).json({ error: err?.message || "Internal server error" });
        } else {
            res.end();
        }
    }
};

chatRouter.all("/", handleChat);
chatRouter.all("/stream", (req: Request, res: Response) => {
    req.headers["x-stream"] = "true";
    return handleChat(req, res);
});

export default chatRouter;
