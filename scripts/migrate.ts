import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as schema from "../db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
});

const db = drizzle(pool, { schema });

async function runMigration() {
  console.log("Starting database migration...");

  try {
    // Verify database connection
    await pool.query('SELECT NOW()');
    console.log("Database connection verified");

    // Run migrations
    await migrate(db, {
      migrationsFolder: "./drizzle",
    });
    console.log("Migrations completed successfully");

    // Verify schema
    const tables = await pool.query(`
      SELECT table_name, column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);

    console.log("\nVerified database schema:");
    const groupedTables = tables.rows.reduce((acc: any, row: any) => {
      if (!acc[row.table_name]) {
        acc[row.table_name] = [];
      }
      acc[row.table_name].push(row);
      return acc;
    }, {});

    Object.entries(groupedTables).forEach(([tableName, columns]) => {
      console.log(`\n${tableName}:`);
      (columns as any[]).forEach((col: any) => {
        console.log(`  - ${col.column_name} (${col.data_type}${col.is_nullable === 'NO' ? ', NOT NULL' : ''})`);
      });
    });

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration().catch((error) => {
  console.error("Unhandled error during migration:", error);
  process.exit(1);
});