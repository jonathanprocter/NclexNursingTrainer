import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "@db";

const app = express();

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Middleware
app.use(cors());
app.use(express.json());

// Register routes
const server = registerRoutes(app);

// Run migrations
async function main() {
  // Check if database URL is available
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  console.log('Running database migrations...');
  try {
    await migrate(db, {
      migrationsFolder: "drizzle",
    });
    console.log('Database migrations completed successfully');
  } catch (err) {
    console.error('Failed to run migrations:', err);
    throw err;
  }

  const port = process.env.PORT || 5001;
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});