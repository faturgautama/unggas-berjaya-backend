/*
  Warnings:

  - Added the required column `ref_id` to the `pelanggan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pelanggan" ADD COLUMN     "ref_id" TEXT NOT NULL;
