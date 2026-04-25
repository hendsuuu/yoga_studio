-- CreateTable
CREATE TABLE "pending_entitlements" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'scalev',
    "orderId" TEXT,
    "membershipExpiresAt" TIMESTAMP(3) NOT NULL,
    "claimedAt" TIMESTAMP(3),
    "claimedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pending_entitlements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pending_entitlements_orderId_key" ON "pending_entitlements"("orderId");

-- CreateIndex
CREATE INDEX "pending_entitlements_email_claimedAt_idx" ON "pending_entitlements"("email", "claimedAt");

-- AddForeignKey
ALTER TABLE "pending_entitlements" ADD CONSTRAINT "pending_entitlements_claimedByUserId_fkey" FOREIGN KEY ("claimedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
