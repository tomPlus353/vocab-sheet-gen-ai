ALTER TABLE "UserTermSrsState"
ADD COLUMN "nextPromptType" TEXT NOT NULL DEFAULT 'reading';

ALTER TABLE "UserTermSrsState"
ADD CONSTRAINT "UserTermSrsState_nextPromptType_check"
CHECK ("nextPromptType" IN ('reading', 'meaning'));
