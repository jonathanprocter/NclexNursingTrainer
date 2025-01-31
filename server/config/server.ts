import express from 'express';
import { PortManager } from '../utils/portManager';
import { errorHandler } from '../middleware/errorHandler';
import { healthCheck } from '../routes/health';

export class Server {
  private app = express();
  private port: number = 3000;

  constructor() {
    this.setupMiddleware();
    this.setupRoutes();
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

  private setupRoutes(): void {
    // Health check endpoint
    this.app.use('/health', healthCheck);

    // Add your routes here
    this.app.use('/api', require('../routes').default);

    // Error handling should be last
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Try to get locked port first
      const lockedPort = await PortManager.getLockedPort();
      this.port = lockedPort || await PortManager.findAvailablePort();

      const server = this.app.listen(this.port, () => {
        console.log(`Server running on port ${this.port}`);
      });

      // Handle graceful shutdown
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
