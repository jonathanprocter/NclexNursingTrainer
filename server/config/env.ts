
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('4004'),
  DATABASE_URL: z.string().optional(),
  FRONTEND_URL: z.string().default('http://0.0.0.0:3000'),
  BACKEND_URL: z.string().default('http://0.0.0.0:4004'),
});

const env = envSchema.parse(process.env);

export default env;
