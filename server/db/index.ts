import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from './schema';

// Configure neon to use WebSocket for better connection stability
neonConfig.webSocketConstructor = WebSocket;
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

// Export schema for use in routes
export * from './schema';