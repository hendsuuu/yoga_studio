CREATE TABLE "private_yoga_sessions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "private_yoga_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "private_yoga_sessions_date_isActive_idx" ON "private_yoga_sessions"("date", "isActive");
CREATE INDEX "private_yoga_sessions_coachId_idx" ON "private_yoga_sessions"("coachId");

ALTER TABLE "private_yoga_sessions"
ADD CONSTRAINT "private_yoga_sessions_coachId_fkey"
FOREIGN KEY ("coachId") REFERENCES "coaches"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
