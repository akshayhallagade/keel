import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, env } from 'prisma/config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
process.loadEnvFile(path.join(dirname, '.env'))

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
