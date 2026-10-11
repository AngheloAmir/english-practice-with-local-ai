const http = require('http');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const RUNTIME_FILE = path.join(__dirname, '.runtime.json');
const KOKORO_PORT = 8880;
const DEFAULT_MODEL = 'kokoro-82m';

let activeComposeFiles = ['-f', 'docker-compose.yml'];
let hardwareInfo = {
    os: `${os.type()} (${process.platform} ${os.arch()})`,
    cpu: `${os.cpus()[0]?.model || 'Standard CPU'} (${os.cpus().length} threads)`,
    ram: `${(os.totalmem() / (1024 ** 3)).toFixed(1)} GB`,
    gpuMode: 'CPU Mode (Zero-Config)'
};

console.log('==================================================');
console.log('       Kokoro-82M TTS Smart Orchestrator          ');
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

            exec('docker run --rm --gpus all --entrypoint true ghcr.io/remsky/kokoro-fastapi-gpu:latest', (dErr) => {
                const gpuComposePath = path.join(__dirname, 'docker-compose.gpu.yml');
                if (!dErr && fs.existsSync(gpuComposePath)) {
                    console.log('[Detect] GPU: NVIDIA GPU acceleration verified and enabled!');
                    activeComposeFiles = ['-f', 'docker-compose.yml', '-f', 'docker-compose.gpu.yml'];
                    hardwareInfo.gpuMode = 'NVIDIA GPU Acceleration';
                } else {
                    console.log('[Detect] GPU: Running in CPU mode (Kokoro is extremely fast on CPU).');
                    hardwareInfo.gpuMode = 'CPU Mode (Driver found, Docker CPU fallback)';
                }
                resolve();
            });
        });
    });
};

// 3. Start Docker Compose
const startDocker = () => {
    console.log(`\nStarting Kokoro TTS container (${hardwareInfo.gpuMode})...`);
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

    // Reverse-proxy /v1/* requests directly to backend Kokoro service (port 8880)
    if (req.url.startsWith('/v1/')) {
        const proxyHeaders = { ...req.headers };
        proxyHeaders.host = `127.0.0.1:${KOKORO_PORT}`;

        const proxyReq = http.request({
            hostname: '127.0.0.1',
            port: KOKORO_PORT,
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
            res.end(JSON.stringify({ error: 'Failed to communicate with Kokoro engine: ' + err.message }));
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

// 5. Poll for Kokoro service readiness
const startMonitoring = () => {
    checkKokoroStatus();
};

const checkKokoroStatus = () => {
    // Check either /health or /v1/models
    const check = spawn('curl', ['-s', '-f', `http://localhost:${KOKORO_PORT}/health`]);
    
    check.on('close', (code) => {
        if (code === 0) {
            console.log('Kokoro-82M TTS engine is ready and responsive!');
            finalizeStartup();
        } else {
            setTimeout(checkKokoroStatus, 2000);
        }
    });
};

// 6. Write runtime file and display clean banner
const finalizeStartup = () => {
    exec('docker ps --filter "ancestor=ghcr.io/remsky/kokoro-fastapi-cpu:latest" --format "{{.Names}}"', (err, stdout) => {
        const lines = stdout ? stdout.trim().split('\n') : [];
        const containerName = lines.length > 0 ? lines[0].trim() : `${process.env.PROJECT_NAME || 'monotime'}-tts-kokoro`;

        try {
            const address = server.address();
            fs.writeFileSync(RUNTIME_FILE, JSON.stringify({ 
                port: address.port, 
                pid: process.pid,
                servicePort: KOKORO_PORT,
                containerName: containerName,
                model: DEFAULT_MODEL,
                hardware: hardwareInfo
            }));
            
            process.stdout.write('\x1Bc');
            console.log('\n==================================================');
            console.log('Service:           Kokoro-82M (Native English TTS)');
            console.log('Model Size:        82 Million Parameters (~300 MB)');
            console.log('Memory Footprint:  ~350 MB RAM/VRAM');
            console.log(`Execution Mode:    ${hardwareInfo.gpuMode}`);
            console.log('==================================================');
            console.log(`API Endpoint:      http://localhost:${KOKORO_PORT}/v1/audio/speech`);
            console.log(`Web Testbench UI:  http://localhost:${address.port}`);
            console.log('Stop Command:      npm run stop');
            console.log('==== Native Voices ===============================');
            console.log('* US Voices: af_heart, af_bella, am_adam, am_michael');
            console.log('* UK Voices: bf_alice, bf_emma, bm_george, bm_lewis');
            console.log('==================================================\n');
        } catch (e) {
            console.error('Failed to write runtime file:', e);
        }
    });
};

// 7. Graceful shutdown
const cleanup = () => {
    console.log('\nStopping Kokoro TTS service...');
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
