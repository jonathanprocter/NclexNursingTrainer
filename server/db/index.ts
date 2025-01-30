import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Validate environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create SQL connection with proper error handling
const sql = neon(process.env.DATABASE_URL);

// Initialize Drizzle with the schema
export const db = drizzle(sql, { 
  schema,
  logger: process.env.NODE_ENV === 'development'
});

// Export schema types
export * from './schema';

// Database connection test function
export async function testConnection() {
  try {
    const result = await db.query.modules.findFirst();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

// Helper function to perform database health check
export async function checkDatabaseHealth() {
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection test failed');
    }
    return {
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === 'development' 
        ? (error as Error).message 
        : 'Internal Server Error'
    };
  }
}