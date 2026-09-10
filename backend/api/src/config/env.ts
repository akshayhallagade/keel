import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

const dirname = path.dirname(fileURLToPath(import.meta.url))

function load(file: string) {
  try {
    process.loadEnvFile(file)
  } catch {
    // Absent is fine — the host may inject these directly.
  }
}

// DATABASE_URL lives in @keel/db's .env, which is also what the Prisma CLI
// reads (see backend/db/prisma.config.ts). Loading it here rather than keeping
// a second copy means `pnpm db:migrate` and the running API can never end up
// pointed at different databases.
load(path.join(dirname, '../../../db/.env'))
// The API's own .env second, so it wins on anything it sets.
load(path.join(dirname, '../../.env'))

/// 32 characters is the shortest secret worth having: anyone who guesses it can
/// mint a token for any account. The old rule was min(1), which "change-me"
/// passed — so a forgotten placeholder would have booted a real server happily.
const JWT_SECRET_MIN = 32

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z
    .string()
    .min(
      JWT_SECRET_MIN,
      `JWT_SECRET must be at least ${JWT_SECRET_MIN} characters. Generate one with: openssl rand -base64 48`,
    ),
  WEB_ORIGIN: z.string().default('http://localhost:5173'),
})

export const env = envSchema.parse(process.env)
