const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const RUNTIME_FILE = path.join(__dirname, '.runtime.json');

const UPSTREAM = {
    ollama: { host: '127.0.0.1', port: 11434, pathPrefix: '/proxy/ollama' },
    tts: { host: '127.0.0.1', port: 8880, pathPrefix: '/proxy/tts' },
    whisper: { host: '127.0.0.1', port: 8000, pathPrefix: '/proxy/whisper' }
};

// Quick health check helper for upstreams
const checkService = (host, port, pingPath = '/') => {
    return new Promise((resolve) => {
        const req = http.request({
            host,
            port,
            path: pingPath,
            method: 'GET',
            timeout: 1500
        }, (res) => {
            resolve(res.statusCode < 500);
        });
        req.on('error', () => resolve(false));
        req.on('timeout', () => { req.destroy(); resolve(false); });
        req.end();
    });
};

const server = http.createServer(async (req, res) => {
    // Enable CORS for development flexibility
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    // 1. Health check route
    if (req.url === '/api/health') {
        const [ollamaOk, ttsOk, whisperOk] = await Promise.all([
            checkService('127.0.0.1', 11434, '/api/tags'),
            checkService('127.0.0.1', 8880, '/health'),
            checkService('127.0.0.1', 8000, '/health')
        ]);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            services: {
                ollama: { ok: ollamaOk, port: 11434, name: 'Qwen 2.5 (11434)' },
                tts: { ok: ttsOk, port: 8880, name: 'Kokoro TTS (8880)' },
                whisper: { ok: whisperOk, port: 8000, name: 'Faster-Whisper (8000)' }
            },
            allReady: ollamaOk && ttsOk && whisperOk
        }));
    }

    // 2. Stop route
    if (req.url === '/stop') {
        res.writeHead(200);
        res.end('Server shutting down...');
        cleanup();
        return;
    }

    // 3. Reverse Proxies (Pipes directly to preserve streams/multipart)
    for (const [key, target] of Object.entries(UPSTREAM)) {
        if (req.url.startsWith(target.pathPrefix)) {
            const strippedPath = req.url.slice(target.pathPrefix.length) || '/';
            const proxyHeaders = { ...req.headers };
            proxyHeaders.host = `${target.host}:${target.port}`;

            const proxyReq = http.request({
                hostname: target.host,
                port: target.port,
                path: strippedPath,
                method: req.method,
                headers: proxyHeaders
            }, (proxyRes) => {
                const resHeaders = { ...proxyRes.headers };
                resHeaders['access-control-allow-origin'] = '*';
                res.writeHead(proxyRes.statusCode, resHeaders);
                proxyRes.pipe(res);
            });

            proxyReq.on('error', (err) => {
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: `Cannot reach ${key} service at ${target.host}:${target.port}`,
                    message: err.message
                }));
            });

            req.pipe(proxyReq);
            return;
        }
    }

    // 4. Serve index.html
    if (req.url === '/' || req.url.startsWith('/?')) {
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error loading index.html');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
            }
        });
        return;
    }

    // 404 fallback
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});

const cleanup = () => {
    try {
        if (fs.existsSync(RUNTIME_FILE)) {
            fs.unlinkSync(RUNTIME_FILE);
        }
    } catch (e) {}
    process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

server.listen(PORT, '0.0.0.0', () => {
    const address = server.address();
    const activePort = typeof address === 'object' ? address.port : PORT;

    fs.writeFileSync(RUNTIME_FILE, JSON.stringify({
        port: activePort,
        pid: process.pid,
        startedAt: new Date().toISOString()
    }, null, 2));

    console.log('================================================================');
    console.log('     English Pronunciation Practice Loop Web App               ');
    console.log('================================================================');
    console.log(` Web App URL:      http://localhost:${activePort}`);
    console.log(` Reverse Proxies:  /proxy/ollama -> 11434`);
    console.log(`                   /proxy/tts    -> 8880`);
    console.log(`                   /proxy/whisper-> 8000`);
    console.log(' Press Ctrl+C or run "npm run stop" to exit.');
    console.log('================================================================');
});
