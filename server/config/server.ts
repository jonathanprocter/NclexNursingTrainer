import express from 'express';
import { PortManager } from '../utils/portManager.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { router as routes } from '../routes/index.js';

export class Server {
  private app = express();
  private port: number = 3000;

  constructor() {
    this.setupMiddleware();
  }

  async initialize() {
    await this.setupRoutes();
    return this;
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Add CORS handling for Replit environment
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
      next();
    });
  }

  private async setupRoutes(): Promise<void> {
    try {
      this.app.use('/api', routes);
      this.app.use(errorHandler);
    } catch (error) {
      console.error('Error setting up routes:', error);
      throw error;
    }
  }

  public async start(): Promise<void> {
    try {
      const lockedPort = await PortManager.getLockedPort();
      this.port = lockedPort || await PortManager.findAvailablePort();

      const server = this.app.listen(this.port, () => {
        console.log(`Server running on port ${this.port}`);
      });

      process.on('SIGTERM', () => this.shutdown(server));
      process.on('SIGINT', () => this.shutdown(server));
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private async shutdown(server: any): Promise<void> {
    console.log('Shutting down server...');
    await PortManager.releasePort();
    server.close(() => {
      console.log('Server shut down');
      process.exit(0);
    });
  }
}
