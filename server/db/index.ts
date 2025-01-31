import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema.js';

// Validate environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create SQL connection with proper error handling
const sql = neon(process.env.DATABASE_URL);

// Initialize Drizzle with the schema
export const db = drizzle(sql, { schema });

// Export schema types
export * from './schema.js';

// Helper function to perform database health check
export async function checkDatabaseHealth() {
  try {
    const result = await db.query.modules.findFirst();
    return {
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      details: 'Database connection successful'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown database error',
      details: 'Failed to connect to database'
    };
  }
}

// Add a type-safe query builder helper
export function createQueryBuilder() {
  return {
    modules: db.query.modules,
    questions: db.query.questions,
    quizAttempts: db.query.quizAttempts,
    userProgress: db.query.userProgress,
  };
}