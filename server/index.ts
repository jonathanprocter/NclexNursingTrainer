import { config } from 'dotenv';
config();
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { registerRoutes } from "./routes.js";
import { setupVite } from "./vite.js";
import { checkDatabaseHealth } from './db.js';
import analyticsRoutes from './routes/analytics.js';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://0.0.0.0:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/health', async (_req: Request, res: Response) => {
  const health = await checkDatabaseHealth();
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});

app.use('/api/analytics', analyticsRoutes);
const server = registerRoutes(app);

if (process.env.NODE_ENV === 'development') {
  setupVite(app, server);
}

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

const PORT = Number(process.env.PORT || 4003);
const HOST = '0.0.0.0';

function startServer() {
  return new Promise((resolve, reject) => {
    try {
      const serverInstance = server.listen(PORT, HOST, () => {
        console.log('=================================');
        console.log('Server started successfully');
        console.log(`Server is running on port ${PORT}`);
        console.log(`Frontend URL: http://0.0.0.0:3000`);
        console.log(`Access URL: http://${HOST}:${PORT}`);
        console.log('=================================');
        if (process.send) {
          process.send('ready');
        }
        resolve(serverInstance);
      });

      serverInstance.on('error', (err: NodeJS.ErrnoException) => {
        console.error('Server error:', err);
        reject(err);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      reject(error);
    }
  });
}

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

startServer().catch((error) => {
  console.error('Server startup failed:', error);
  process.exit(1);
});

export default app;

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});