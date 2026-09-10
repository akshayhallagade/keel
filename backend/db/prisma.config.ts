import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, env } from 'prisma/config'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// Absent is fine, and must be: CI and any deployed host inject DATABASE_URL
// directly and have no .env file at all. Unguarded, this threw there.
try {
  process.loadEnvFile(path.join(dirname, '.env'))
} catch {
  // No local .env — fall through to whatever the environment already provides.
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'tsx src/seed.ts',
  },
  engine: 'classic',
  datasource: {
    url: env('DATABASE_URL'),
  },
})
