-- Multi-company support: Company + UserCompany tables, companyId on all tenant tables.
-- Existing rows are backfilled to the first company "The Rich 24".

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCompany" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCompany_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserCompany_userId_companyId_key" ON "UserCompany"("userId", "companyId");

-- Seed the first company so existing rows have an owner
INSERT INTO "Company" ("name", "updatedAt") VALUES ('The Rich 24', CURRENT_TIMESTAMP);

-- AlterTable: add companyId as NULLABLE first (existing rows), backfill, then enforce NOT NULL
ALTER TABLE "Product" ADD COLUMN "companyId" INTEGER;
ALTER TABLE "StockIn" ADD COLUMN "companyId" INTEGER;
ALTER TABLE "Employee" ADD COLUMN "companyId" INTEGER;
ALTER TABLE "Platform" ADD COLUMN "companyId" INTEGER;
ALTER TABLE "Shop" ADD COLUMN "companyId" INTEGER;
ALTER TABLE "Order" ADD COLUMN "companyId" INTEGER;
ALTER TABLE "Expense" ADD COLUMN "companyId" INTEGER;
ALTER TABLE "ProductReturn" ADD COLUMN "companyId" INTEGER;

-- Backfill all existing rows to "The Rich 24"
UPDATE "Product" SET "companyId" = (SELECT "id" FROM "Company" WHERE "name" = 'The Rich 24');
UPDATE "StockIn" SET "companyId" = (SELECT "id" FROM "Company" WHERE "name" = 'The Rich 24');
UPDATE "Employee" SET "companyId" = (SELECT "id" FROM "Company" WHERE "name" = 'The Rich 24');
UPDATE "Platform" SET "companyId" = (SELECT "id" FROM "Company" WHERE "name" = 'The Rich 24');
UPDATE "Shop" SET "companyId" = (SELECT "id" FROM "Company" WHERE "name" = 'The Rich 24');
UPDATE "Order" SET "companyId" = (SELECT "id" FROM "Company" WHERE "name" = 'The Rich 24');
UPDATE "Expense" SET "companyId" = (SELECT "id" FROM "Company" WHERE "name" = 'The Rich 24');
UPDATE "ProductReturn" SET "companyId" = (SELECT "id" FROM "Company" WHERE "name" = 'The Rich 24');

-- Enforce NOT NULL now that every row is backfilled
ALTER TABLE "Product" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "StockIn" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "Employee" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "Platform" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "Shop" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "Expense" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "ProductReturn" ALTER COLUMN "companyId" SET NOT NULL;

-- DropIndex: Platform.name was globally unique; now unique per company
DROP INDEX "Platform_name_key";

-- CreateIndex
CREATE INDEX "Employee_companyId_idx" ON "Employee"("companyId");
CREATE INDEX "Expense_companyId_idx" ON "Expense"("companyId");
CREATE INDEX "Order_companyId_idx" ON "Order"("companyId");
CREATE INDEX "Platform_companyId_idx" ON "Platform"("companyId");
CREATE UNIQUE INDEX "Platform_name_companyId_key" ON "Platform"("name", "companyId");
CREATE INDEX "Product_companyId_idx" ON "Product"("companyId");
CREATE INDEX "ProductReturn_companyId_idx" ON "ProductReturn"("companyId");
CREATE INDEX "Shop_companyId_idx" ON "Shop"("companyId");
CREATE INDEX "StockIn_companyId_idx" ON "StockIn"("companyId");

-- AddForeignKey
ALTER TABLE "UserCompany" ADD CONSTRAINT "UserCompany_userId_fkey" FOREIGN KEY ("userId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserCompany" ADD CONSTRAINT "UserCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockIn" ADD CONSTRAINT "StockIn_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Platform" ADD CONSTRAINT "Platform_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductReturn" ADD CONSTRAINT "ProductReturn_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
