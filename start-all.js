const { spawn } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname);

/**
 * Robustly run a command in a subdirectory.
 * Handles Windows paths with spaces and process termination.
 */
function runService(name, command, args, cwd) {
    console.log(`[${name}] Starting in ${cwd}...`);

    // shell: true is often needed on Windows to find global commands, 
    // but we use absolute paths to node modules to be safer.
    const child = spawn(command, args, {
        cwd,
        shell: true,
        stdio: 'inherit'
    });

    child.on('error', (err) => {
        console.error(`[${name}] Error starting process:`, err);
    });

    child.on('exit', (code, signal) => {
        if (code !== null) {
            console.log(`[${name}] Process exited with code ${code}`);
        } else if (signal !== null) {
            console.log(`[${name}] Process killed with signal ${signal}`);
        }

        // If one service dies, kill the entire wrapper to alert the user
        if (code !== 0 && code !== null) {
            process.exit(code);
        }
    });

    return child;
}

// 1. Start Backend (nodemon)
// We point directly to the nodemon.js file to avoid PATH/CMD shim issues
const backendPath = path.resolve(root, 'backend');
const nodemonBin = path.resolve(backendPath, 'node_modules', 'nodemon', 'bin', 'nodemon.js');

runService('BACKEND', 'node', [
    `"${nodemonBin}"`,
    'server.js'
], backendPath);

// 2. Start Frontend (vite)
// We point directly to the vite.js file
const frontendPath = path.resolve(root, 'frontend');
const viteBin = path.resolve(frontendPath, 'node_modules', 'vite', 'bin', 'vite.js');

runService('FRONTEND', 'node', [
    `"${viteBin}"`
], frontendPath);

// Handle termination signals
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
