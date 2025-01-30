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

// Enhanced CORS configuration for development
const allowedOrigins = [
  'http://localhost:3000',
  'http://0.0.0.0:3000',
  'http://0.0.0.0:4002',
  'http://localhost:4002',
  process.env.NODE_ENV === 'production' ? process.env.PRODUCTION_URL : null,
  // Handle Replit preview URLs
  /\.repl\.co$/,
  /\.replit\.dev$/
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(allowed => 
      typeof allowed === 'string' 
        ? allowed === origin 
        : allowed.test(origin)
    )) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin} not allowed`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Database health check
app.get('/health', async (_req: Request, res: Response) => {
  const health = await checkDatabaseHealth();
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});

// Register all API routes
const server = registerRoutes(app);

// Setup Vite development server middleware in development mode
if (process.env.NODE_ENV === 'development') {
  setupVite(app, server);
}

// Global error handling middleware
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

const PORT = parseInt(process.env.PORT || '4002', 10);
const HOST = '0.0.0.0';

function startServer() {
  return new Promise((resolve, reject) => {
    try {
      let retries = 0;
      const maxRetries = 5;
      const startServerWithRetry = () => {
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
          if (err.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is in use. Retrying...`);
            retries++;
            if (retries < maxRetries) {
              setTimeout(startServerWithRetry, 1000);
            } else {
              console.error(`Failed to start server after ${maxRetries} retries`);
              reject(err);
            }
          } else {
            console.error('Server error:', err);
            reject(err);
          }
        });
      };

      startServerWithRetry();
    } catch (error) {
      console.error('Failed to start server:', error);
      reject(error);
    }
  });
}

// Handle process signals
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start the server and export for testing
startServer()
  .catch((error) => {
    console.error('Server startup failed:', error);
    process.exit(1);
  });

export default app;