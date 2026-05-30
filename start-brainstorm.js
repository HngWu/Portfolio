const cp = require('child_process');
const path = require('path');

const serverPath = 'C:/Users/pc/.gemini/config/plugins/superpowers/skills/brainstorming/scripts/server.cjs';
const brainstormDir = 'C:/Projects/Portfolio/.superpowers/brainstorm/session-active';

console.log('Spawning brainstorm server from:', serverPath);
console.log('Using BRAINSTORM_DIR:', brainstormDir);

const child = cp.fork(serverPath, [], {
  env: {
    ...process.env,
    BRAINSTORM_DIR: brainstormDir
  }
});

child.on('message', (msg) => {
  console.log('Server message:', msg);
});

child.on('error', (err) => {
  console.error('Failed to start server:', err);
});

child.on('exit', (code, signal) => {
  console.log(`Server exited with code ${code} and signal ${signal}`);
});
