import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '0', 10),
  DATABASE_URL: process.env.DATABASE_URL,
  
  // Add your other environment variables here
  
  validate() {
    const requiredVars = ['DATABASE_URL'];
    for (const v of requiredVars) {
      if (!this[v]) {
        throw new Error(`Missing required environment variable: ${v}`);
      }
    }
  }
};
