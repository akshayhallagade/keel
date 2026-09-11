-- A week does not only start on Monday or Sunday. Saturday is the norm across
-- much of the Middle East and North Africa, and Friday in some places. The two
-- allowed values were a UI assumption that had leaked into the column.
--
-- Inserted positionally rather than appended. Postgres orders an enum by the
-- order its values were added, so a plain ADD VALUE would leave the type
-- sorted MON, SUN, TUE, WED, ... — which is nonsense the first time anyone
-- writes ORDER BY "weekStart". AFTER puts them in ISO-8601 order.
--
-- Safe inside Prisma's transaction on PostgreSQL 12+: a value added in a
-- transaction may not be *used* before it commits, and nothing here uses one.
ALTER TYPE "WeekStart" ADD VALUE 'TUE' AFTER 'MON';
ALTER TYPE "WeekStart" ADD VALUE 'WED' AFTER 'TUE';
ALTER TYPE "WeekStart" ADD VALUE 'THU' AFTER 'WED';
ALTER TYPE "WeekStart" ADD VALUE 'FRI' AFTER 'THU';
ALTER TYPE "WeekStart" ADD VALUE 'SAT' AFTER 'FRI';
