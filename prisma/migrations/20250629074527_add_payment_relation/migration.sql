/*
  Warnings:

  - You are about to drop the column `id_payment` on the `invoice` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "invoice" DROP CONSTRAINT "invoice_id_payment_fkey";

-- DropIndex
DROP INDEX "invoice_id_payment_key";

-- AlterTable
ALTER TABLE "invoice" DROP COLUMN "id_payment";

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_id_invoice_fkey" FOREIGN KEY ("id_invoice") REFERENCES "invoice"("id_invoice") ON DELETE RESTRICT ON UPDATE CASCADE;
