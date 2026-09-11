-- Case-insensitive text, so the unique index on email stops depending on every
-- writer remembering to lowercase first.
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE "Theme" AS ENUM ('light', 'dark');
CREATE TYPE "WeekStart" AS ENUM ('MON', 'SUN');

-- Column sizes, citext, and the soft-delete column.
ALTER TABLE "users"
  ADD COLUMN "deletedAt" TIMESTAMP(3),
  ALTER COLUMN "email" SET DATA TYPE CITEXT,
  ALTER COLUMN "passwordHash" SET DATA TYPE VARCHAR(60),
  ALTER COLUMN "name" SET DATA TYPE VARCHAR(80),
  ALTER COLUMN "occupation" SET DATA TYPE VARCHAR(120),
  ALTER COLUMN "livingSituation" SET DATA TYPE VARCHAR(120),
  ALTER COLUMN "moneyHabits" SET DATA TYPE VARCHAR(120),
  ALTER COLUMN "investing" SET DATA TYPE VARCHAR(120),
  ALTER COLUMN "organization" SET DATA TYPE VARCHAR(120),
  ALTER COLUMN "hobbyInterest" SET DATA TYPE VARCHAR(120),
  ALTER COLUMN "reminderStyle" SET DATA TYPE VARCHAR(120),
  ALTER COLUMN "primaryGoal" SET DATA TYPE VARCHAR(120),
  ALTER COLUMN "timezone" SET DATA TYPE VARCHAR(64),
  ALTER COLUMN "accent" SET DATA TYPE VARCHAR(7);

-- theme and weekStart: converted in place with USING, not dropped and re-added.
-- Prisma's generated diff does DROP COLUMN + ADD COLUMN here, which would reset
-- every user's saved preference to the default. The cast below keeps the values,
-- and fails loudly if any row holds something outside the enum — which is what
-- should happen, rather than silently defaulting it.
-- The default has to come off before the type changes, and go back after.
ALTER TABLE "users" ALTER COLUMN "theme" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "theme" SET DATA TYPE "Theme" USING "theme"::"Theme";
ALTER TABLE "users" ALTER COLUMN "theme" SET DEFAULT 'light';

ALTER TABLE "users" ALTER COLUMN "weekStart" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "weekStart" SET DATA TYPE "WeekStart" USING "weekStart"::"WeekStart";
ALTER TABLE "users" ALTER COLUMN "weekStart" SET DEFAULT 'MON';
