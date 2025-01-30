import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";
import { checkDatabaseHealth } from './db';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", require("./routes"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", require("./routes"));


// Security middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : true,
  credentials: true
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

const PORT = parseInt(process.env.PORT || '4001', 10);
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log('=================================');
  console.log('Server started successfully');
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access URL: http://${HOST}:${PORT}`);
  console.log('=================================');
});

export default app;