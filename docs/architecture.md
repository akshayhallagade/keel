# Architecture

Keel is a pnpm + Turborepo monorepo.

```
keel/
├── apps/web        React 19 + Vite frontend
├── backend/api      Express REST API (routes → controllers → services → repositories → db)
├── backend/db        Prisma schema, migrations, seed script — the only package that imports the ORM directly
├── packages/types      Shared TypeScript interfaces (User, AuthSession, ...)
└── packages/validation Shared Zod schemas, used for both form validation (web) and request validation (api)
```

## Request flow (backend/api)

`routes/` parse nothing, just wire URLs to controllers.
`controllers/` parse the request (via `@keel/validation` schemas), call a service, shape the response.
`services/` hold business logic and never touch `req`/`res`.
`repositories/` are the only files that call `@keel/db`'s Prisma client.

## Auth

JWT-based. `POST /auth/signup` and `POST /auth/login` return `{ user, accessToken }`. The web app
stores the token in `localStorage` (see `apps/web/src/api/client.ts`) and sends it as
`Authorization: Bearer <token>`. `requireAuth` middleware verifies the token and sets `req.userId`.

## Environment variables

Each runnable package has its own `.env.example`:

- `backend/api/.env.example` — `PORT`, `JWT_SECRET`, `WEB_ORIGIN`
- `backend/db/.env.example` — `DATABASE_URL`
- `apps/web/.env.example` — `VITE_API_URL`

`DATABASE_URL` is set once, in `backend/db/.env`. Both the Prisma CLI
(`backend/db/prisma.config.ts`) and the API (`backend/api/src/config/env.ts`)
read it from there, so a migration and the running server cannot end up
pointed at different databases.

Copy each to `.env` in the same directory before running `pnpm dev:api` / `pnpm dev:web` / `pnpm db:migrate`.
