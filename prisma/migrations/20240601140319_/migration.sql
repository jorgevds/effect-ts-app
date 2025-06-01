-- CreateTable
CREATE TABLE "Chore" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "timePerformed" TIMESTAMP(3) NOT NULL,
    "timeInvalid" TIMESTAMP(3) NOT NULL,
    "estimationMinutes" INTEGER NOT NULL,

    CONSTRAINT "Chore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Chore_locationId_key" ON "Chore"("locationId");

-- AddForeignKey
ALTER TABLE "Chore" ADD CONSTRAINT "Chore_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
