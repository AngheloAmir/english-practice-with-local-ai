const http = require('http');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const RUNTIME_FILE = path.join(__dirname, '.runtime.json');
const OLLAMA_PORT = 11434;
const DEFAULT_MODEL = 'qwen2.5:3b';

let activeComposeFiles = ['-f', 'docker-compose.yml'];
let hardwareInfo = {
    os: `${os.type()} (${process.platform} ${os.arch()})`,
    cpu: `${os.cpus()[0]?.model || 'Standard CPU'} (${os.cpus().length} threads)`,
    ram: `${(os.totalmem() / (1024 ** 3)).toFixed(1)} GB`,
    gpuMode: 'CPU Mode (Zero-Config)'
};

console.log('==================================================');
console.log('       Ollama Smart Zero-Config Orchestrator      ');
console.log('==================================================');

// 1. Verify Docker is installed and running
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

        // Check if NVIDIA GPU and Docker GPU support are available
        exec('nvidia-smi', (err) => {
            if (err) {
                console.log('[Detect] GPU: No NVIDIA GPU detected. Using optimized CPU mode.');
                hardwareInfo.gpuMode = 'CPU Mode (Standard)';
                return resolve();
            }

            // Verify Docker NVIDIA Container Toolkit runtime
            exec('docker run --rm --gpus all --entrypoint true ollama/ollama:latest', (dErr) => {
                const gpuComposePath = path.join(__dirname, 'docker-compose.gpu.yml');
                if (!dErr && fs.existsSync(gpuComposePath)) {
                    console.log('[Detect] GPU: NVIDIA GPU acceleration verified and enabled!');
                    activeComposeFiles = ['-f', 'docker-compose.yml', '-f', 'docker-compose.gpu.yml'];
                    hardwareInfo.gpuMode = 'NVIDIA GPU Acceleration';
                } else {
                    console.log('[Detect] GPU: NVIDIA driver found, but Docker GPU runtime unavailable.');
                    console.log('[Detect] Running safely in CPU mode (Fast & zero-crash for 3B).');
                    hardwareInfo.gpuMode = 'CPU Mode (Driver found, Docker CPU fallback)';
                }
                resolve();
            });
        });
    });
};

// 3. Start Docker Compose
const startDocker = () => {
    console.log(`\nStarting Ollama container (${hardwareInfo.gpuMode})...`);
    const child = spawn('docker', ['compose', ...activeComposeFiles, 'up', '-d', '--remove-orphans'], { stdio: 'inherit' });

    child.on('close', (code) => {
        if (code !== 0) {
            console.error('Failed to start Docker Compose');
            process.exit(code);
        }
        startMonitoring();
    });
};

// 4. Setup Local Control and Web UI Server
const server = http.createServer((req, res) => {
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
    } else if (req.url === '/') {
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

// 5. Poll for Ollama service availability
const startMonitoring = () => {
    checkOllamaStatus();
};

const checkOllamaStatus = () => {
    const check = spawn('curl', ['-s', '-f', `http://localhost:${OLLAMA_PORT}/api/tags`]);
    
    check.on('close', (code) => {
        if (code === 0) {
            console.log('Ollama engine is ready and responsive!');
            ensureModelExists();
        } else {
            setTimeout(checkOllamaStatus, 2000);
        }
    });
};

// 6. Ensure default model (qwen2.5:3b) is downloaded
const ensureModelExists = () => {
    exec('docker ps --filter "ancestor=ollama/ollama" --format "{{.Names}}"', (err, stdout) => {
        const lines = stdout ? stdout.trim().split('\n') : [];
        const containerName = lines.length > 0 ? lines[0].trim() : `${process.env.PROJECT_NAME || 'monotime'}-ollama`;
        
        exec(`docker exec ${containerName} ollama list`, (err2, stdout2) => {
            if (stdout2 && stdout2.includes(DEFAULT_MODEL)) {
                console.log(`Default model "${DEFAULT_MODEL}" is ready locally.`);
                finalizeStartup(containerName);
            } else {
                console.log(`\nDefault model "${DEFAULT_MODEL}" (~1.9 GB) not found locally.`);
                console.log('Downloading model from Ollama library (this only happens once)...');
                
                const pull = spawn('docker', ['exec', '-it', containerName, 'ollama', 'pull', DEFAULT_MODEL], { stdio: 'inherit' });
                pull.on('close', (code) => {
                    if (code === 0) {
                        console.log(`\nModel "${DEFAULT_MODEL}" downloaded successfully!`);
                    } else {
                        console.warn(`\nWarning: Model pull exited with code ${code}.`);
                    }
                    finalizeStartup(containerName);
                });
            }
        });
    });
};

// 7. Write runtime file and display clean user banner
const finalizeStartup = (containerName) => {
    try {
        const address = server.address();
        fs.writeFileSync(RUNTIME_FILE, JSON.stringify({ 
            port: address.port, 
            pid: process.pid,
            servicePort: OLLAMA_PORT,
            containerName: containerName,
            model: DEFAULT_MODEL,
            hardware: hardwareInfo
        }));
        
        process.stdout.write('\x1Bc');
        console.log('\n==================================================');
        console.log('Service:           Ollama (Grammar Evaluation Engine)');
        console.log(`Model:             ${DEFAULT_MODEL} (~1.9 GB download)`);
        console.log('Memory Footprint:  ~2.2 GB VRAM/RAM (2048 Context Window)');
        console.log(`Execution Mode:    ${hardwareInfo.gpuMode}`);
        console.log('==================================================');
        console.log(`Ollama API:        http://localhost:${OLLAMA_PORT}`);
        console.log(`Web Chat UI:       http://localhost:${address.port}`);
        console.log('Stop Command:      npm run stop');
        console.log('==== Test Grammar via CLI ========================');
        console.log(`docker exec -it ${containerName} ollama run ${DEFAULT_MODEL} "Correct my grammar: She don't like it."`);
        console.log('==================================================\n');
    } catch (e) {
        console.error('Failed to write runtime file:', e);
    }
};

// 8. Graceful shutdown
const cleanup = () => {
    console.log('\nStopping Ollama service...');
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
