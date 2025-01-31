cat > server/routes/index.ts << 'EOF'
import express from 'express';
import analyticsRouter from './analytics';
import questionsRouter from './questions';
import practiceRouter from './practice';
import simulationsRouter from './simulations';
import { healthCheck } from './health';

const router = express.Router();

// Health check endpoint
router.get('/health', healthCheck);

// Register all routes
router.use('/analytics', analyticsRouter);
router.use('/questions', questionsRouter);
router.use('/practice', practiceRouter);
router.use('/simulations', simulationsRouter);

// Error handling middleware
router.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Export using ES modules
export default router;
EOF

# Update server configuration
cat > server/config/server.ts << 'EOF'
import express from 'express';
import { PortManager } from '../utils/portManager';
import { errorHandler } from '../middleware/errorHandler';
import routes from '../routes';

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
      // Add routes
      if (!routes || typeof routes !== 'function') {
        throw new Error('Routes not properly exported');
      }
      this.app.use('/api', routes);

      // Error handling should be last
      this.app.use(errorHandler);
    } catch (error) {
      console.error('Error setting up routes:', error);
      throw error;
    }
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
EOF

# Create health check route
cat > server/routes/health.ts << 'EOF'
import { Request, Response } from 'express';

export const healthCheck = (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
};
EOF

# Create basic route files
# Analytics routes
cat > server/routes/analytics.ts << 'EOF'
import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Analytics endpoint' });
});

export default router;
EOF

# Questions routes
cat > server/routes/questions.ts << 'EOF'
import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Questions endpoint' });
});

export default router;
EOF

# Practice routes
cat > server/routes/practice.ts << 'EOF'
import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Practice endpoint' });
});

export default router;
EOF

# Simulations routes
cat > server/routes/simulations.ts << 'EOF'
import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Simulations endpoint' });
});

export default router;
EOF

# Create error handler middleware
cat > server/middleware/errorHandler.ts << 'EOF'
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: err.message || 'Internal Server Error'
  });
};
EOF

# Create port manager utility
cat > server/utils/portManager.ts << 'EOF'
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
EOF