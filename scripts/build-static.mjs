import { spawn } from 'node:child_process';

console.log('Static HTML fallback disabled. Running the normal TanStack Start build instead.');

const child = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
