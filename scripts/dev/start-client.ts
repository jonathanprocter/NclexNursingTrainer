
import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

const client = spawn('npm', ['run', 'dev:client'], {
  stdio: 'inherit',
  shell: true,
  cwd: root,
  env: {
    ...process.env,
    NODE_OPTIONS: '--max-old-space-size=2048'
  }
});

process.on('SIGINT', () => client.kill());
process.on('SIGTERM', () => client.kill());
