/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[performerId]` on the table `Chore` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[instructionId]` on the table `Chore` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Location` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- AlterTable
ALTER TABLE "Chore" ADD COLUMN     "instructionId" TEXT,
ADD COLUMN     "performerId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "Profile";

-- CreateTable
CREATE TABLE "Instruction" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Instruction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Instruction_name_key" ON "Instruction"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Chore_performerId_key" ON "Chore"("performerId");

-- CreateIndex
CREATE UNIQUE INDEX "Chore_instructionId_key" ON "Chore"("instructionId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_key" ON "Location"("name");

-- AddForeignKey
ALTER TABLE "Chore" ADD CONSTRAINT "Chore_performerId_fkey" FOREIGN KEY ("performerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chore" ADD CONSTRAINT "Chore_instructionId_fkey" FOREIGN KEY ("instructionId") REFERENCES "Instruction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
