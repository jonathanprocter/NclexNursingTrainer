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

// CORS configuration with appropriate settings for development
app.use(cors({
  origin: ['http://localhost:3000', 'http://0.0.0.0:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

const startPort = parseInt(process.env.PORT || '4001', 10);
const HOST = '0.0.0.0';

const startServer = (port: number) => {
  server.listen(port, HOST)
    .on('listening', () => {
      console.log('=================================');
      console.log('Server started successfully');
      console.log(`Server is running on port ${port}`);
      console.log(`Access URL: http://${HOST}:${port}`);
      console.log('=================================');
    })
    .on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is busy, trying ${port + 1}`);
        startServer(port + 1);
      } else {
        throw err;
      }
    });
};

startServer(startPort);

export default app;