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
  // A folder, not a file: Prisma reads every .prisma inside it. Models are
  // split one file per domain so this stays navigable as the table count grows.
  schema: 'prisma/schema',
  migrations: {
    // Must be stated now that `schema` is a folder: Prisma otherwise resolves
    // migrations relative to the schema path and looks in prisma/schema/
    // migrations, finds nothing, and would happily start a fresh baseline
    // alongside two that are already applied.
    path: 'prisma/migrations',
    seed: 'tsx src/seed.ts',
  },
  engine: 'classic',
  datasource: {
    url: env('DATABASE_URL'),
  },
})
