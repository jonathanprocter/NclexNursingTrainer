import { createServer } from 'net';
import fs from 'fs/promises';
import path from 'path';

export class PortManager {
  private static readonly MIN_PORT = 3000;
  private static readonly MAX_PORT = 9000;
  private static readonly PORT_FILE = path.join(process.cwd(), '.port-lock');

  static async findAvailablePort(startPort: number = this.MIN_PORT): Promise<number> {
    const isPortAvailable = (port: number): Promise<boolean> => {
      return new Promise((resolve) => {
        const server = createServer();
        server.once('error', () => {
          resolve(false);
        });
        server.once('listening', () => {
          server.close();
          resolve(true);
        });
        server.listen(port);
      });
    };

    for (let port = startPort; port <= this.MAX_PORT; port++) {
      if (await isPortAvailable(port)) {
        await this.lockPort(port);
        return port;
      }
    }
    
    throw new Error('No available ports found');
  }

  static async lockPort(port: number): Promise<void> {
    try {
      await fs.writeFile(this.PORT_FILE, port.toString());
    } catch (error) {
      console.warn('Could not write port lock file:', error);
    }
  }

  static async getLockedPort(): Promise<number | null> {
    try {
      const port = await fs.readFile(this.PORT_FILE, 'utf-8');
      return parseInt(port, 10);
    } catch {
      return null;
    }
  }

  static async releasePort(): Promise<void> {
    try {
      await fs.unlink(this.PORT_FILE);
    } catch {
      // Ignore if file doesn't exist
    }
  }
}
