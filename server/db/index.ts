import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon, neonConfig } from '@neondatabase/serverless';
import { WebSocket } from 'ws';
import * as schema from './schema';
import type { NeonClient } from '@neondatabase/serverless';

// Configure neon to use WebSocket for better connection stability
neonConfig.webSocketConstructor = WebSocket;
const sql = neon(process.env.DATABASE_URL!) as NeonClient;

// Create database connection with proper typing
export const db = drizzle(sql, { schema });

// Export schema for use in routes
export * from './schema';