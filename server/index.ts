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
    origin: "*",

    // Or specify an array of allowed origins instead:
    // origin: ['https://somefrontend.example', 'https://another-allowed-domain'],

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

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const HOST = "0.0.0.0"; // Listen on all interfaces

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

    // Finally, start the server
    server.listen(PORT, HOST, () => {
      console.log("=================================");
      console.log("Server started successfully");
      console.log(`Server is running on port ${PORT}`);
      console.log(`Access URL: http://${HOST}:${PORT}`);
      console.log("=================================");
      log(`Server running on http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
