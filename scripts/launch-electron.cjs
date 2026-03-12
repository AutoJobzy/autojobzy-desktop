/**
 * Electron launcher - removes ELECTRON_RUN_AS_NODE before spawning.
 * VSCode sets ELECTRON_RUN_AS_NODE=1 which breaks Electron entirely.
 */
const { spawn } = require('child_process');
const electron = require('electron');

// Must completely delete this var - setting to "0" or "" does NOT work
delete process.env.ELECTRON_RUN_AS_NODE;

const child = spawn(electron, ['.'], {
  stdio: 'inherit',
  env: process.env,
});

child.on('close', (code) => process.exit(code || 0));
