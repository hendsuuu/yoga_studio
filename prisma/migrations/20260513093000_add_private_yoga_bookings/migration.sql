CREATE TABLE "private_yoga_bookings" (
    "id" TEXT NOT NULL,
    "privateYogaId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "email" TEXT,
    "age" INTEGER,
    "gender" TEXT,
    "experience" TEXT,
    "goal" TEXT NOT NULL,
    "healthNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "private_yoga_bookings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "private_yoga_bookings_privateYogaId_whatsapp_key" ON "private_yoga_bookings"("privateYogaId", "whatsapp");
CREATE INDEX "private_yoga_bookings_privateYogaId_createdAt_idx" ON "private_yoga_bookings"("privateYogaId", "createdAt");

ALTER TABLE "private_yoga_bookings"
ADD CONSTRAINT "private_yoga_bookings_privateYogaId_fkey"
FOREIGN KEY ("privateYogaId") REFERENCES "private_yoga_sessions"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
