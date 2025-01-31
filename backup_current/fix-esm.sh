cat > server/routes/index.ts << 'EOF'
import express from 'express';
import analyticsRouter from './analytics.js';
import questionsRouter from './questions.js';
import practiceRouter from './practice.js';
import simulationsRouter from './simulations.js';
import { healthCheck } from './health.js';

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

// Export the router
export { router };
EOF

# Update server/config/server.ts
cat > server/config/server.ts << 'EOF'
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
EOF

# Update other route files to use ES modules
cat > server/routes/analytics.ts << 'EOF'
import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Analytics endpoint' });
});

export default router;
EOF

# Update server/index.ts
cat > server/index.ts << 'EOF'
import { Server } from './config/server.js';

async function bootstrap() {
  try {
    const server = new Server();
    await server.initialize();
    await server.start();
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
EOF