import { createServer } from 'net';

export class PortManager {
  private static lockedPort: number | null = null;

  static async findAvailablePort(startPort: number = 3000): Promise<number> {
    return new Promise((resolve, reject) => {
      const server = createServer();
      server.listen(startPort, () => {
        const port = (server.address() as any).port;
        server.close(() => resolve(port));
      });
      server.on('error', (err) => {
        if ((err as any).code === 'EADDRINUSE') {
          this.findAvailablePort(startPort + 1)
            .then(resolve)
            .catch(reject);
        } else {
          reject(err);
        }
      });
    });
  }

  static async getLockedPort(): Promise<number | null> {
    return this.lockedPort;
  }

  static async releasePort(): Promise<void> {
    this.lockedPort = null;
  }
}
