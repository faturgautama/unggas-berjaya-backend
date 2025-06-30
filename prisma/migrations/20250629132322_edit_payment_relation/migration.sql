-- DropForeignKey
ALTER TABLE "payment" DROP CONSTRAINT "payment_id_invoice_fkey";

-- AlterTable
ALTER TABLE "payment" ALTER COLUMN "id_invoice" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_id_invoice_fkey" FOREIGN KEY ("id_invoice") REFERENCES "invoice"("id_invoice") ON DELETE SET NULL ON UPDATE CASCADE;
