import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import cors from 'cors';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import type { Server } from "http";

const app = express();

// Security middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'development' 
    ? [process.env.FRONTEND_URL || 'http://localhost:5000', 'http://localhost:3000'] 
    : process.env.FRONTEND_URL,
  credentials: true
}));

// Enhanced request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Capture JSON responses for logging
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        const responsePreview = JSON.stringify(capturedJsonResponse).slice(0, 150);
        logLine += ` :: ${responsePreview}${responsePreview.length > 149 ? '…' : ''}`;
      }
      log(logLine);
    }
  });

  next();
});

// Configuration for running server
const HOST = process.env.HOST || '0.0.0.0';
const DEFAULT_PORT = 5000;

const tryPort = async (port: number): Promise<number> => {
  try {
    // Register API routes first
    const server = registerRoutes(app);

    if (process.env.NODE_ENV === "development") {
      // Setup Vite after API routes
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Enhanced error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Error:', err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ 
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      });
    });

    // Fallback route handler
    app.use((_req: Request, res: Response) => {
      res.status(404).json({ message: "Not Found" });
    });

    return new Promise((resolve, reject) => {
      server.once('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          server.close();
          resolve(tryPort(port + 1));
        } else {
          reject(err);
        }
      });

      server.listen(port, HOST, () => {
        log(`Server running on http://${HOST}:${port}`);
        resolve(port);
      });
    });
  } catch (error) {
    if (port > DEFAULT_PORT + 10) throw error;
    return tryPort(port + 1);
  }
};

// Start server with enhanced error handling
(async () => {
  try {
    const startPort = parseInt(process.env.PORT || DEFAULT_PORT.toString(), 10);
    await tryPort(startPort);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();