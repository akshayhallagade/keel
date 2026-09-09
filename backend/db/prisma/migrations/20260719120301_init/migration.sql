-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "occupation" TEXT,
    "livingSituation" TEXT,
    "moneyHabits" TEXT,
    "investing" TEXT,
    "organization" TEXT,
    "hobbyInterest" TEXT,
    "reminderStyle" TEXT,
    "primaryGoal" TEXT,
    "onboardedAt" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "emailVerifiedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accent" TEXT NOT NULL DEFAULT '#C64F3B',
    "theme" TEXT NOT NULL DEFAULT 'light',
    "weekStart" VARCHAR(3) NOT NULL DEFAULT 'MON',
    "prefQuote" BOOLEAN NOT NULL DEFAULT true,
    "prefDigest" BOOLEAN NOT NULL DEFAULT true,
    "prefAlerts" BOOLEAN NOT NULL DEFAULT true,
    "prefSip" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
