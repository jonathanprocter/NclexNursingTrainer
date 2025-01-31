import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

const server = spawn('tsx', ['watch', 'server/index.ts'], {
  stdio: 'inherit',
  shell: true,
  cwd: root
});

process.on('SIGINT', () => server.kill());
process.on('SIGTERM', () => server.kill());
