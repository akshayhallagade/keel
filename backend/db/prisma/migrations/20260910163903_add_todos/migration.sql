-- CreateEnum
CREATE TYPE "TodoBucket" AS ENUM ('TODAY', 'THIS_WEEK', 'SOMEDAY');

-- CreateTable
CREATE TABLE "todos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" VARCHAR(500) NOT NULL,
    "area" VARCHAR(40) NOT NULL,
    "bucket" "TodoBucket" NOT NULL DEFAULT 'TODAY',
    "dueAt" TIMESTAMP(3),
    "starred" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "todos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "todos_userId_deletedAt_createdAt_idx" ON "todos"("userId", "deletedAt", "createdAt");

-- AddForeignKey
ALTER TABLE "todos" ADD CONSTRAINT "todos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
