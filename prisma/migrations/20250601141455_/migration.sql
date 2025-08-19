/*
  Warnings:

  - You are about to drop the column `performerId` on the `Chore` table. All the data in the column will be lost.
  - You are about to drop the column `timePerformed` on the `Chore` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[choreListId]` on the table `Chore` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,locationId]` on the table `Chore` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,performanceId]` on the table `Chore` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Chore" DROP CONSTRAINT "Chore_performerId_fkey";

-- DropIndex
DROP INDEX "Chore_locationId_key";

-- DropIndex
DROP INDEX "Chore_performerId_key";

-- AlterTable
ALTER TABLE "Chore" DROP COLUMN "performerId",
DROP COLUMN "timePerformed",
ADD COLUMN     "choreListId" TEXT,
ADD COLUMN     "performanceId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT;

-- CreateTable
CREATE TABLE "Performance" (
    "id" TEXT NOT NULL,
    "performerId" TEXT,
    "timePerformed" TIMESTAMP(3) NOT NULL,
    "minutesPerformed" INTEGER NOT NULL,
    "choreId" TEXT NOT NULL,

    CONSTRAINT "Performance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Performance_performerId_timePerformed_choreId_key" ON "Performance"("performerId", "timePerformed", "choreId");

-- CreateIndex
CREATE UNIQUE INDEX "Chore_choreListId_key" ON "Chore"("choreListId");

-- CreateIndex
CREATE UNIQUE INDEX "Chore_name_locationId_key" ON "Chore"("name", "locationId");

-- CreateIndex
CREATE UNIQUE INDEX "Chore_name_performanceId_key" ON "Chore"("name", "performanceId");

-- AddForeignKey
ALTER TABLE "Performance" ADD CONSTRAINT "Performance_choreId_fkey" FOREIGN KEY ("choreId") REFERENCES "Chore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performance" ADD CONSTRAINT "Performance_performerId_fkey" FOREIGN KEY ("performerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
