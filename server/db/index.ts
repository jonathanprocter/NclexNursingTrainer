import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon, neonConfig } from '@neondatabase/serverless';
import { WebSocket } from 'ws';
import * as schema from './schema';

// Configure neon to use WebSocket for better connection stability
neonConfig.webSocketConstructor = WebSocket;

// Ensure DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create the SQL connection
const sql = neon(process.env.DATABASE_URL);

// Create database connection with proper typing
export const db = drizzle(sql, { schema });

// Export schema for use in routes
export * from './schema';

// Add a function to test the database connection
export async function testConnection() {
  try {
    // Try a simple query
    const result = await db.query.modules.findFirst();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}