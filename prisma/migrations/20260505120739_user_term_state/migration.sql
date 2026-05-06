-- CreateTable
CREATE TABLE "UserTermState" (
    "userId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "gravityScore" INTEGER,
    "gravityReadingScore" INTEGER,
    "isLearnt" BOOLEAN,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTermState_pkey" PRIMARY KEY ("userId","termId")
);

-- AddForeignKey
ALTER TABLE "UserTermState" ADD CONSTRAINT "UserTermState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTermState" ADD CONSTRAINT "UserTermState_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;
