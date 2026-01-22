-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "commissionType" TEXT NOT NULL DEFAULT 'percentage',
ADD COLUMN     "commissionValue" DOUBLE PRECISION NOT NULL DEFAULT 0.05;
