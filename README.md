# Keel

A pnpm + Turborepo monorepo. See [docs/architecture.md](docs/architecture.md) for the full layout
and [docs/api-contracts.md](docs/api-contracts.md) for the backend API.

## Getting started

```bash
pnpm install

# copy env files and fill in real values
cp apps/web/.env.example apps/web/.env
cp backend/api/.env.example backend/api/.env
cp backend/db/.env.example backend/db/.env

pnpm db:generate     # generate the Prisma client
pnpm db:migrate       # run migrations against DATABASE_URL

pnpm dev:web          # http://localhost:5173
pnpm dev:api          # http://localhost:4000
```

## Scripts

| Script                                                    | Description                              |
| --------------------------------------------------------- | ---------------------------------------- |
| `pnpm dev:web` / `pnpm dev:api`                           | Run the frontend / backend in watch mode |
| `pnpm build`                                              | Build all packages (Turborepo, cached)   |
| `pnpm test`                                               | Run all test suites                      |
| `pnpm lint` / `pnpm format`                               | Lint / format the whole repo             |
| `pnpm db:generate` / `pnpm db:migrate` / `pnpm db:studio` | Prisma commands for `backend/db`         |
