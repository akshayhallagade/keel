import { z } from 'zod'

try {
  process.loadEnvFile()
} catch {
  // no .env file present — rely on vars injected by the host environment
}

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  WEB_ORIGIN: z.string().default('http://localhost:5173'),
})

export const env = envSchema.parse(process.env)
