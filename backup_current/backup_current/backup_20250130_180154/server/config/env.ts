import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('4003'),
  DATABASE_URL: z.string(),
  FRONTEND_URL: z.string().default('http://0.0.0.0:3000'),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
});

const env = envSchema.parse(process.env);

export default env;
