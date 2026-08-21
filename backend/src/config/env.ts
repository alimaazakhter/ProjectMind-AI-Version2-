import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  FASTAPI_URL: z.string().default('http://localhost:8000/api/v1/ai'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables configuration:', parsedEnv.error.format());
}

export const env = parsedEnv.success
  ? parsedEnv.data
  : {
      PORT: process.env.PORT || '5000',
      NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
      FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
      CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      FASTAPI_URL: process.env.FASTAPI_URL || 'http://localhost:8000/api/v1/ai',
    };
