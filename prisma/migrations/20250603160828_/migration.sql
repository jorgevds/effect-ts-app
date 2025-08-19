/*
  Warnings:

  - You are about to drop the column `performanceId` on the `Chore` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Chore_name_performanceId_key";

-- AlterTable
ALTER TABLE "Chore" DROP COLUMN "performanceId";
