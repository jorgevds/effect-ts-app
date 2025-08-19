-- CreateTable
CREATE TABLE "ChoreList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "complete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ChoreList_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Chore" ADD CONSTRAINT "Chore_choreListId_fkey" FOREIGN KEY ("choreListId") REFERENCES "ChoreList"("id") ON DELETE SET NULL ON UPDATE CASCADE;
