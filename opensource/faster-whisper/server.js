const http = require('http');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const RUNTIME_FILE = path.join(__dirname, '.runtime.json');
const WHISPER_PORT = 8000;
const DEFAULT_MODEL = 'Systran/faster-whisper-base';

let activeComposeFiles = ['-f', 'docker-compose.yml'];
let hardwareInfo = {
    os: `${os.type()} (${process.platform} ${os.arch()})`,
    cpu: `${os.cpus()[0]?.model || 'Standard CPU'} (${os.cpus().length} threads)`,
    ram: `${(os.totalmem() / (1024 ** 3)).toFixed(1)} GB`,
    gpuMode: 'CPU Mode (Zero-Config)'
};

console.log('==================================================');
console.log('     Faster-Whisper STT Smart Orchestrator        ');
console.log('==================================================');

// 1. Verify Docker is running
const verifyDocker = () => {
    return new Promise((resolve) => {
        exec('docker info', (err) => {
            if (err) {
                console.error('\n[ERROR] Docker is not running or not installed!');
                console.error('Please make sure Docker Desktop or the Docker daemon is running,');
                console.error('then run "npm start" again.\n');
                process.exit(1);
            }
            resolve();
        });
    });
};

// 2. Hardware and GPU Detection
const detectHardware = () => {
    return new Promise((resolve) => {
        console.log(`[Detect] OS:  ${hardwareInfo.os}`);
        console.log(`[Detect] CPU: ${hardwareInfo.cpu}`);
        console.log(`[Detect] RAM: ${hardwareInfo.ram}`);

        exec('nvidia-smi', (err) => {
            if (err) {
                console.log('[Detect] GPU: No NVIDIA GPU detected. Using optimized CPU mode.');
                hardwareInfo.gpuMode = 'CPU Mode (Standard)';
                return resolve();
            }

            exec('docker run --rm --gpus all --entrypoint true ghcr.io/speaches-ai/speaches:latest-cuda', (dErr) => {
                const gpuComposePath = path.join(__dirname, 'docker-compose.gpu.yml');
                if (!dErr && fs.existsSync(gpuComposePath)) {
                    console.log('[Detect] GPU: NVIDIA GPU acceleration verified and enabled!');
                    activeComposeFiles = ['-f', 'docker-compose.yml', '-f', 'docker-compose.gpu.yml'];
                    hardwareInfo.gpuMode = 'NVIDIA GPU Acceleration';
                } else {
                    console.log('[Detect] GPU: Running in CPU mode (Fast & zero-crash for Whisper Base).');
                    hardwareInfo.gpuMode = 'CPU Mode (Driver found, Docker CPU fallback)';
                }
                resolve();
            });
        });
    });
};

// 3. Start Docker Compose
const startDocker = () => {
    console.log(`\nStarting Faster-Whisper container (${hardwareInfo.gpuMode})...`);
    const child = spawn('docker', ['compose', ...activeComposeFiles, 'up', '-d', '--remove-orphans'], { stdio: 'inherit' });

    child.on('close', (code) => {
        if (code !== 0) {
            console.error('Failed to start Docker Compose');
            process.exit(code);
        }
        startMonitoring();
    });
};

// 4. Setup Local Control, Same-Origin Proxy, and Web UI Server
const server = http.createServer((req, res) => {
    // CORS headers for all incoming requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    // Reverse-proxy /v1/* requests directly to backend Speaches service (port 8000)
    // This completely prevents browser CORS issues on the frontend!
    if (req.url.startsWith('/v1/')) {
        const proxyHeaders = { ...req.headers };
        proxyHeaders.host = `127.0.0.1:${WHISPER_PORT}`;

        const proxyReq = http.request({
            hostname: '127.0.0.1',
            port: WHISPER_PORT,
            path: req.url,
            method: req.method,
            headers: proxyHeaders
        }, (proxyRes) => {
            const resHeaders = { ...proxyRes.headers };
            resHeaders['access-control-allow-origin'] = '*';
            res.writeHead(proxyRes.statusCode, resHeaders);
            proxyRes.pipe(res);
        });

        proxyReq.on('error', (err) => {
            res.writeHead(502, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ error: 'Failed to communicate with Faster-Whisper engine: ' + err.message }));
        });

        req.pipe(proxyReq);
        return;
    }

    if (req.url === '/stop') {
        res.writeHead(200);
        res.end('Stopping...');
        cleanup();
    } else if (req.url === '/info') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        try {
            const runtime = JSON.parse(fs.readFileSync(RUNTIME_FILE, 'utf8'));
            res.end(JSON.stringify(runtime));
        } catch (e) {
            res.end(JSON.stringify({ containerName: 'unknown', model: DEFAULT_MODEL, hardware: hardwareInfo }));
        }
    } else if (req.url === '/' || req.url.startsWith('/?')) {
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading UI');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(0, '0.0.0.0', () => {});

// 5. Poll for Faster-Whisper service readiness
const startMonitoring = () => {
    checkWhisperStatus();
};

const checkWhisperStatus = () => {
    const check = spawn('curl', ['-s', '-f', `http://localhost:${WHISPER_PORT}/health`]);
    
    check.on('close', (code) => {
        if (code === 0) {
            console.log('Faster-Whisper engine is ready and responsive!');
            ensureModelExists();
        } else {
            setTimeout(checkWhisperStatus, 2000);
        }
    });
};

// 6. Ensure default model (Systran/faster-whisper-base) is downloaded
const ensureModelExists = () => {
    const checkReq = http.get(`http://127.0.0.1:${WHISPER_PORT}/v1/models`, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            try {
                const data = JSON.parse(body);
                const models = data.data || [];
                const hasModel = models.some(m => m.id === DEFAULT_MODEL);
                
                if (hasModel) {
                    console.log(`Default model "${DEFAULT_MODEL}" is ready.`);
                    finalizeStartup();
                } else {
                    console.log(`\nModel "${DEFAULT_MODEL}" (~140 MB) not found in local registry.`);
                    console.log('Downloading model from Hugging Face (this only happens once)...');
                    
                    const postReq = http.request({
                        hostname: '127.0.0.1',
                        port: WHISPER_PORT,
                        path: `/v1/models/${encodeURIComponent(DEFAULT_MODEL)}`,
                        method: 'POST'
                    }, (postRes) => {
                        postRes.on('data', () => {});
                        postRes.on('end', () => {
                            console.log(`\nModel "${DEFAULT_MODEL}" downloaded successfully!`);
                            finalizeStartup();
                        });
                    });
                    
                    postReq.on('error', (err) => {
                        console.warn('Warning: Could not pre-download model:', err.message);
                        finalizeStartup();
                    });
                    
                    postReq.end();
                }
            } catch (e) {
                finalizeStartup();
            }
        });
    });

    checkReq.on('error', () => {
        finalizeStartup();
    });
};

// 7. Write runtime file and display clean banner
const finalizeStartup = () => {
    exec('docker ps --filter "ancestor=ghcr.io/speaches-ai/speaches:latest-cpu" --format "{{.Names}}"', (err, stdout) => {
        const lines = stdout ? stdout.trim().split('\n') : [];
        const containerName = lines.length > 0 ? lines[0].trim() : `${process.env.PROJECT_NAME || 'monotime'}-faster-whisper`;

        try {
            const address = server.address();
            fs.writeFileSync(RUNTIME_FILE, JSON.stringify({ 
                port: address.port, 
                pid: process.pid,
                servicePort: WHISPER_PORT,
                containerName: containerName,
                model: DEFAULT_MODEL,
                hardware: hardwareInfo
            }));
            
            process.stdout.write('\x1Bc');
            console.log('\n==================================================');
            console.log('Service:           Faster-Whisper (Strict STT Engine)');
            console.log(`Default Model:     ${DEFAULT_MODEL} (~140 MB)`);
            console.log('Memory Footprint:  ~300 MB RAM/VRAM');
            console.log(`Execution Mode:    ${hardwareInfo.gpuMode}`);
            console.log('==================================================');
            console.log(`API Endpoint:      http://localhost:${WHISPER_PORT}/v1/audio/transcriptions`);
            console.log(`Web Testbench UI:  http://localhost:${address.port}`);
            console.log('Stop Command:      npm run stop');
            console.log('==== Features ====================================');
            console.log('* Word-Level Confidence & Strict Phonetic Alignment');
            console.log('* Built-in Zero-CORS Proxy on Web UI Port');
            console.log('==================================================\n');
        } catch (e) {
            console.error('Failed to write runtime file:', e);
        }
    });
};

// 8. Graceful shutdown
const cleanup = () => {
    console.log('\nStopping Faster-Whisper service...');
    exec(`docker compose ${activeComposeFiles.join(' ')} down`, () => {
        try { fs.unlinkSync(RUNTIME_FILE); } catch (e) {}
        server.close();
        process.exit(0);
    });
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Boot sequence
(async () => {
    await verifyDocker();
    await detectHardware();
    startDocker();
})();
