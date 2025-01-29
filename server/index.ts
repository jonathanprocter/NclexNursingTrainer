import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// ─────────────────────────────────────────────────────────────
// 1. CORS and Basic Middleware Configuration
// ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: true, // Allow configured origins
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Explicitly handle OPTIONS requests
app.options("*", cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────────────
// 2. Logging Middleware
// ─────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

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
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });

  next();
});

// ─────────────────────────────────────────────────────────────
// 3. Error Handling
// ─────────────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ 
    message: process.env.NODE_ENV === "development" ? err.message : "Internal Server Error"
  });
});

// ─────────────────────────────────────────────────────────────
// 4. Server Setup
// ─────────────────────────────────────────────────────────────
(async () => {
  try {
    const server = registerRoutes(app);

    // Catch-all route handler for SPA
    app.use("*", (req, res, next) => {
      if (req.path.startsWith("/api")) {
        next();
      } else {
        if (process.env.NODE_ENV === "development") {
          next();
        } else {
          res.sendFile("index.html", { root: "./dist/public" });
        }
      }
    });

    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const PORT = parseInt(process.env.PORT || "5000", 10);
    server.listen(PORT, "0.0.0.0", () => {
      console.log("=== SERVER READY ===");
      console.log("=================================");
      console.log(`Server started successfully`);
      console.log(`Server is running on port ${PORT}`);
      console.log(`Access URL: http://0.0.0.0:${PORT}`);
      console.log("=================================");
      log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();