/*
  Warnings:

  - A unique constraint covering the columns `[id_payment]` on the table `invoice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_invoice]` on the table `payment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "payment" DROP CONSTRAINT "payment_id_invoice_fkey";

-- AlterTable
ALTER TABLE "invoice" ADD COLUMN     "id_payment" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "invoice_id_payment_key" ON "invoice"("id_payment");

-- CreateIndex
CREATE UNIQUE INDEX "payment_id_invoice_key" ON "payment"("id_invoice");

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_id_payment_fkey" FOREIGN KEY ("id_payment") REFERENCES "payment"("id_payment") ON DELETE SET NULL ON UPDATE CASCADE;
