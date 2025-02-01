import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "@db";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Register routes
const server = registerRoutes(app);

// Run migrations
async function main() {
  await migrate(db, {
    migrationsFolder: "drizzle",
  });

  const port = process.env.PORT || 5001;
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
