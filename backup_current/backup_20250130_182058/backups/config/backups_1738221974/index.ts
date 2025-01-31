import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";
import { checkDatabaseHealth } from './db';

const app = express();

// Security middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration - using a simpler, less error-prone approach
app.use(cors({
  origin: '*', // Allow requests from any origin for simplicity.  Should be refined for production.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Database health check (from original code)
app.get('/health', async (_req: Request, res: Response) => {
  const health = await checkDatabaseHealth();
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});

// Register all API routes (from original code)
const server = registerRoutes(app);

// Setup Vite development server middleware in development mode (from original code)
if (process.env.NODE_ENV === 'development') {
  setupVite(app, server);
}

// Global error handling middleware (simplified from original and edited)
interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
}

app.use((err: ErrorWithStatus, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});


const HOST = '0.0.0.0';
const PORT = 4003; // Fixed port

function startServer() {
  return new Promise((resolve, reject) => {
    const serverInstance = server.listen(PORT, HOST, () => {
          console.log('=================================');
          console.log('Server started successfully');
          console.log(`Server is running on port ${PORT}`);
          console.log(`Access URL: http://${HOST}:${PORT}`);
          console.log('=================================');

          // Signal that the server is ready
          if (process.send) {
            process.send('ready');
          }

          resolve(serverInstance);
        });

    serverInstance.on('error', (err: NodeJS.ErrnoException) => {
          console.error('Server error:', err);
          reject(err);
        });
  });
}


// Handle process signals (from original code)
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start the server and export for testing (from original code)
startServer()
  .catch((error) => {
    console.error('Server startup failed:', error);
    process.exit(1);
  });

export default app;