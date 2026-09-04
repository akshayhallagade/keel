# API Contracts

Base URL: `http://localhost:4000` (see `apps/web/.env.example` → `VITE_API_URL`)

## `GET /health`

Returns `{ "status": "ok" }`. No auth.

## `POST /auth/signup`

Request body (`packages/validation` → `signupSchema`):

```json
{ "email": "string", "password": "string (min 8)", "name": "string" }
```

Response `201`:

```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "createdAt": "string"
  },
  "accessToken": "string"
}
```

## `POST /auth/login`

Request body (`loginSchema`):

```json
{ "email": "string", "password": "string" }
```

Response `200`: same shape as signup.

## `GET /users/me`

Requires `Authorization: Bearer <accessToken>`.
Response `200`:

```json
{ "id": "string", "email": "string", "name": "string", "createdAt": "string" }
```

## Errors

All error responses are `{ "error": "message" }`, with `400` for validation failures (Zod), `401` for
auth failures, `404` for missing resources, `500` for unhandled errors.
