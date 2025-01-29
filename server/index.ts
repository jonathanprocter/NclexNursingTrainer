import "dotenv/config";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// ─────────────────────────────────────────────────────────────
// 1. CORS Configuration
//    - The 'cors' library will handle all preflight logic.
//    - No need to manually set headers in a second middleware.
// ─────────────────────────────────────────────────────────────
app.use(
  cors({
    // For development or if you truly want to allow everything:
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Allow-Origin",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 600, // Increase preflight cache time (in seconds)
  }),
);

// If you want to explicitly handle OPTIONS requests (optional):
app.options("*", cors());

// ─────────────────────────────────────────────────────────────
// 2. Standard Middleware
// ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────────────
// 3. Request Logging
// ─────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
  });
  next();
});

// ─────────────────────────────────────────────────────────────
// 4. Start Server + Vite/Static Setup
// ─────────────────────────────────────────────────────────────
(async () => {
  try {
    const server = registerRoutes(app);

    // Use Vite in dev or serve static build in production
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // 404 handler for unmatched routes
    app.use((_req: Request, res: Response) => {
      res.status(404).json({ success: false, message: "Not Found" });
    });

    // Global Error Handler (after routes)
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error("Error:", err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      });
    });

    // Enhanced port finding logic
    const findAvailablePort = async (startPort: number, maxRetries = 20): Promise<number> => {
      return new Promise((resolve, reject) => {
        let currentPort = startPort;
        const tryPort = () => {
          console.log(`Attempting to start server on port ${currentPort}...`);
          server.listen(currentPort)
            .once('listening', () => {
              console.log(`Successfully bound to port ${currentPort}`);
              resolve(currentPort);
            })
            .once('error', (err: any) => {
              server.removeAllListeners();
              if (err.code === 'EADDRINUSE') {
                console.log(`Port ${currentPort} is in use`);
                if (currentPort - startPort >= maxRetries) {
                  reject(new Error(`Unable to find an available port after ${maxRetries} attempts`));
                  return;
                }
                currentPort++;
                setTimeout(tryPort, 100);
              } else {
                reject(err);
              }
            });
        };
        tryPort();
      });
    };

    const startPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
    const port = await findAvailablePort(startPort);

    // Add this marker for workflow to detect server readiness
    console.log("=== SERVER READY ===");
    console.log("=================================");
    console.log("Server started successfully");
    console.log(`Server is running on port ${port}`);
    console.log(`Access URL: http://0.0.0.0:${port}`);
    console.log("=================================");
    log(`Server running on http://0.0.0.0:${port}`);

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();