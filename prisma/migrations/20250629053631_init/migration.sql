/*
  Warnings:

  - Added the required column `total` to the `payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payment" ADD COLUMN     "potongan" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL;
