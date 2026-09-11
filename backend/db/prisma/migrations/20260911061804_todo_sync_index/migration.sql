-- "What changed since this device last synced" is the question updatedAt exists
-- to answer, and the only other index leads with createdAt — so that query
-- could only be served by scanning the user's rows and sorting them.
CREATE INDEX "todos_userId_updatedAt_idx" ON "todos"("userId", "updatedAt");
