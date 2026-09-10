/**
 * An error that already knows which HTTP status it deserves.
 *
 * Services throw these; `errorMiddleware` reads the status straight off them.
 * That keeps the mapping next to the thing that knows what went wrong, instead
 * of in a growing `instanceof` chain in the middleware.
 *
 * Anything thrown that is *not* one of these becomes a 500, which is the right
 * default: an error nobody classified is a bug, not a client mistake.
 */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = new.target.name
  }
}

/// 401 — not signed in, or the credentials given were wrong.
export class AuthError extends HttpError {
  constructor(message: string) {
    super(401, message)
  }
}

/// 403 — signed in, but this is not yours.
export class ForbiddenError extends HttpError {
  constructor(message = 'Not allowed') {
    super(403, message)
  }
}

/// 404 — no such record, *or* it belongs to someone else. Those two answer the
/// same way on purpose: a 403 would confirm the record exists.
export class NotFoundError extends HttpError {
  constructor(message = 'Not found') {
    super(404, message)
  }
}

/// 409 — the request is valid but clashes with what is already stored.
export class ConflictError extends HttpError {
  constructor(message: string) {
    super(409, message)
  }
}
