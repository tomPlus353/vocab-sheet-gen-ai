-- Additive migration: new SRS table only, no destructive changes.
CREATE TABLE "UserTermSrsState" (
    "userId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "due" TIMESTAMP(3) NOT NULL,
    "stability" DOUBLE PRECISION NOT NULL,
    "difficulty" DOUBLE PRECISION NOT NULL,
    "repetitions" INTEGER NOT NULL,
    "lapses" INTEGER NOT NULL,
    "state" INTEGER NOT NULL,
    "lastReview" TIMESTAMP(3),
    "scheduledDays" INTEGER NOT NULL,
    "learningSteps" INTEGER NOT NULL,
    "retrievability" DOUBLE PRECISION,
    "lastRating" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTermSrsState_pkey" PRIMARY KEY ("userId","termId")
);

CREATE INDEX "UserTermSrsState_userId_due_idx" ON "UserTermSrsState"("userId", "due");

ALTER TABLE "UserTermSrsState" ADD CONSTRAINT "UserTermSrsState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserTermSrsState" ADD CONSTRAINT "UserTermSrsState_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;
