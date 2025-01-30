require('dotenv').config();
import express from 'express';
import cors from 'cors';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Security middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// CORS configuration for development
if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }));
}

// Error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ 
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Kill any existing process on PORT
const { execSync } = require('child_process');
try {
  execSync(`lsof -ti:${PORT} | xargs kill -9`);
} catch (error) {
  // No process was running on this port
}

app.listen(PORT, HOST, () => {
  console.log('=================================');
  console.log('Server started successfully');
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access URL: http://${HOST}:${PORT}`);
  console.log('=================================');
});

export default app;
