-- AlterTable
ALTER TABLE "invoice" ADD COLUMN     "source" TEXT DEFAULT 'legacy',
ADD COLUMN     "source_sync_at" TIMESTAMP(3);
