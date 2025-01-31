import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

const client = spawn('vite', ['--port', '3000', '--host', '0.0.0.0'], {
  stdio: 'inherit',
  shell: true,
  cwd: root
});

process.on('SIGINT', () => client.kill());
process.on('SIGTERM', () => client.kill());
