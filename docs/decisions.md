# Setup decisions

Rules to follow while building Keel out, and why each one exists.

Right now the app has **one table** (`User`) and **five endpoints**. Every other
screen renders fixed sample data from `apps/web/src/pages/home/seedData.ts`.
That is the good news: almost nothing has been committed to yet, so these
decisions are still cheap to make.

Each rule below says what to do, why, and what it costs to fix later.

---

## The rules

### 1. Every record has an `id`

```prisma
id String @id @default(cuid())
```

The frontend passes that id around. It never identifies a record by its text.

**Why.** Sample data identifies a todo by its own words. In
`apps/web/src/pages/home/state/useTodos.ts` a todo is "the same one" if the text
and the group match. So two todos both called "Call mum" are a single thing to
the app — tick one and both tick. In a database, "which row do I update?" then
has no answer at all.

**Cost of delay.** Touches every list, checkbox and edit button on every screen.

### 2. Money is a whole number of paise

`₹499` is stored as `49900`. Formatting happens only when drawing to screen.

**Why.** The sample data has `price: '₹499'` — text. Text cannot be added,
sorted or totalled, so a budget screen built on it can never show a real total.

Whole numbers rather than decimals because computers cannot store `0.1`
exactly: `0.1 + 0.2` comes out as `0.30000000000000004`. In money that is a
rupee missing from a total with no way to trace it. Integers have no such
problem.

**Cost of delay.** Re-parsing every record ever saved, guessing at formats.

### 3. Dates are dates, times are times

Never a sentence. The sample data has `due: 'OVERDUE 2D · MONTHLY'`, which is
three facts in one string: a date, a status, and a repeat rule.

- Due date → a real `DateTime` column.
- "Overdue" → not stored. Worked out when read.
- Repeat rule → its own column, added when recurrence is actually built.

**Why.** You cannot sort, filter or fire a reminder from a sentence.

### 4. Every table has `userId`, and every query filters by it

```prisma
userId String
user   User @relation(fields: [userId], references: [id], onDelete: Cascade)

@@index([userId])
```

**Why.** Added later, you get rows owned by nobody and a real risk of one user
reading another's data.

**How it is enforced here.** Repository functions take `userId` as their first
argument and put it in the `where` clause. A repository call that cannot name an
owner is a bug.

### 5. Store what happened, not what it adds up to

A streak of 12 is not a fact. It is the result of twelve days of ticking a box.

Store the completions — one row per routine per day. Work the streak out from
them.

**Why.** Store the answer and it drifts, and you can never repair it, because
the events that produced it were never recorded.

### 6. Every table carries `createdAt`, `updatedAt`, `deletedAt`

Deleting sets `deletedAt`. Rows are not removed.

**Why.** `updatedAt` is what later answers "what changed since this device last
synced?". Added afterwards, every existing row has no answer. `deletedAt` makes
an accidental delete recoverable.

### 7. Design the record, then the screen

When wiring a screen to a real endpoint, do **not** shape the API to match what
the screen renders today.

The sample data was written to look right on screen. `'OVERDUE 2D · MONTHLY'` is
a sentence for a human, not a record. Design the record properly, then change the
screen to render it. Screens are cheap to change. Data is not, once real people
have filled it in.

---

## Decisions taken

| Question       | Decision                                                                            | Revisit when                                                     |
| -------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Session length | One JWT, 7 days, in `localStorage`. No refresh tokens.                              | "Log out all devices" is wanted, or sessions need to be shorter. |
| Todo buckets   | `bucket` (TODAY / THIS WEEK / SOMEDAY) stays a stored field, separate from `dueAt`. | It starts disagreeing with `dueAt` often enough to annoy.        |
| Recurrence     | Not built for todos. Routines own repetition.                                       | A todo genuinely needs to repeat.                                |
| Time zone      | Stored per user; nothing reads it yet.                                              | The first scheduled email or push is built.                      |
| IDs            | `cuid()`, not auto-increment integers.                                              | Never — sequential ids leak how many users you have.             |

---

## Plan

Ordered so that nothing later has to undo something earlier.

### Phase 1 — Security and infrastructure

No schema changes. Small and self-contained.

- [x] `JWT_SECRET` must be at least 32 characters
- [x] Fix the `@` in the database password so the URL parses
- [x] Duplicate-email signup returns 409, not 401
- [x] Run a real Postgres in CI

### Phase 2 — Make settings save

The columns exist and `PATCH /users/me` exists. The screen never calls it.

- [x] Settings writes through to the API
- [x] Appearance and preferences load from the signed-in user, not `localStorage`

### Phase 3 — Todos, end to end

The first real domain. It is the worked example of every rule above; the other
screens follow its shape.

- [x] `Todo` table: id, userId, real `dueAt`, timestamps, soft delete
- [x] Repository, service, controller, routes
- [x] Validation schemas in `@keel/validation`
- [x] Tests covering ownership and the date handling
- [x] Frontend talks to the API instead of holding sample data

### Later — the rest

Each follows the Todo shape. Not started.

- [ ] Routines, plus a completions table so streaks are counted, not stored
- [ ] Projects and their tasks
- [ ] Money: accounts, spend, budget — paise as integers throughout
- [ ] Alarms and reminders — real times, real repeat rules
- [ ] Life: goals, books, quotes, wishlist
- [ ] Email verification flow (`emailVerifiedAt` already exists)
- [ ] Scheduled digests and alerts — the first thing that needs `timezone`
- [ ] Error tracking (Sentry or similar) — needs a new dependency, so ask first
- [ ] Deployment config — no host chosen yet
