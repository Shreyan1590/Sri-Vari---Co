const { spawn } = require('child_process');
const path = require('path');

const root = __dirname;
const mobilePath = path.join(root, 'mobile');
const capBin = path.join(mobilePath, 'node_modules', '@capacitor', 'cli', 'bin', 'capacitor');

const args = process.argv.slice(2);

console.log(`[CAP] Running: cap ${args.join(' ')}`);

const child = spawn('node', [`"${capBin}"`, ...args], {
    cwd: mobilePath,
    shell: true,
    stdio: 'inherit'
});

child.on('exit', (code) => {
    process.exit(code);
});
