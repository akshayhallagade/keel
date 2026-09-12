-- Which list a todo belongs in is a question about *now*, so storing the answer
-- was wrong: a todo filed under TODAY on Monday was still under TODAY on
-- Wednesday. It is derived from dueAt and the user's weekStart at read time.
--
-- Nothing is lost. There was no way to set this column in the interface, so
-- every row held the default, and the two other lists were permanently empty.
ALTER TABLE "todos" DROP COLUMN "bucket";
DROP TYPE "TodoBucket";
