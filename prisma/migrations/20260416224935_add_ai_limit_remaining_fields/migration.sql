-- AlterTable
ALTER TABLE "users" ADD COLUMN "aiDailyLimitMax" INTEGER NOT NULL DEFAULT 6;
ALTER TABLE "users" ADD COLUMN "aiLimitResetDate" TIMESTAMP(3);

-- Initialize aiDailyLimitMax from existing aiDailyLimit values
UPDATE "users" SET "aiDailyLimitMax" = "aiDailyLimit";
