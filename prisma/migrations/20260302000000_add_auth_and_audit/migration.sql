-- CreateTable: app_users
CREATE TABLE "app_users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_users_username_key" ON "app_users"("username");

-- AddColumn audit fields to Product
ALTER TABLE "Product" ADD COLUMN "createdById" INTEGER;
ALTER TABLE "Product" ADD COLUMN "updatedById" INTEGER;

-- AddColumn audit fields to StockIn
ALTER TABLE "StockIn" ADD COLUMN "createdById" INTEGER;

-- AddColumn audit fields to Employee
ALTER TABLE "Employee" ADD COLUMN "createdById" INTEGER;
ALTER TABLE "Employee" ADD COLUMN "updatedById" INTEGER;

-- AddColumn audit fields to Platform
ALTER TABLE "Platform" ADD COLUMN "createdById" INTEGER;
ALTER TABLE "Platform" ADD COLUMN "updatedById" INTEGER;

-- AddColumn audit fields to Shop
ALTER TABLE "Shop" ADD COLUMN "createdById" INTEGER;
ALTER TABLE "Shop" ADD COLUMN "updatedById" INTEGER;

-- AddColumn audit fields to Order
ALTER TABLE "Order" ADD COLUMN "createdById" INTEGER;

-- AddColumn audit fields to Expense
ALTER TABLE "Expense" ADD COLUMN "createdById" INTEGER;
ALTER TABLE "Expense" ADD COLUMN "updatedById" INTEGER;
ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddColumn audit fields to ProductReturn
ALTER TABLE "ProductReturn" ADD COLUMN "createdById" INTEGER;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "app_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "app_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "StockIn" ADD CONSTRAINT "StockIn_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "app_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Employee" ADD CONSTRAINT "Employee_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "app_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "app_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Platform" ADD CONSTRAINT "Platform_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "app_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Platform" ADD CONSTRAINT "Platform_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "app_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Shop" ADD CONSTRAINT "Shop_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "app_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "app_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Order" ADD CONSTRAINT "Order_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "app_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Expense" ADD CONSTRAINT "Expense_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "app_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "app_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProductReturn" ADD CONSTRAINT "ProductReturn_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "app_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
