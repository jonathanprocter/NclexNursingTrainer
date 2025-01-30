import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

import net from 'net';

const checkPort = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port, '0.0.0.0');
  });
};

const startServer = async () => {
  const port = 4004;
  const isPortAvailable = await checkPort(port);
  
  if (!isPortAvailable) {
    console.error(`Port ${port} is not available`);
    process.exit(1);
  }

  const server = spawn('tsx', ['watch', 'server/index.ts'], {
    stdio: 'inherit',
    shell: true,
    cwd: root
  });
};

startServer();

process.on('SIGINT', () => server.kill());
process.on('SIGTERM', () => server.kill());
