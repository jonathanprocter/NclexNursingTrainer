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
// ─────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["*"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400,
  }),
);

// Explicitly handle OPTIONS requests
app.options("*", cors());

// ─────────────────────────────────────────────────────────────
// 2. Additional Headers for Replit
// ─────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// ─────────────────────────────────────────────────────────────
// 3. Standard Middleware
// ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────────────
// 4. Request Logging
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
// 5. Start Server + Vite/Static Setup
// ─────────────────────────────────────────────────────────────
(async () => {
  try {
    const server = registerRoutes(app);

    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Catch-all route handler for SPA
    app.use("*", (req, res, next) => {
      if (req.path.startsWith("/api")) {
        next();
      } else {
        res.sendFile("index.html", { root: "./client" });
      }
    });

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