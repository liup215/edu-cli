/*
  Warnings:

  - You are about to drop the column `headTeacherId` on the `AdministrativeClass` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_HeadTeachers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_HeadTeachers_A_fkey" FOREIGN KEY ("A") REFERENCES "AdministrativeClass" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_HeadTeachers_B_fkey" FOREIGN KEY ("B") REFERENCES "Teacher" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AdministrativeClass" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AdministrativeClass" ("createdAt", "id", "name", "updatedAt") SELECT "createdAt", "id", "name", "updatedAt" FROM "AdministrativeClass";
DROP TABLE "AdministrativeClass";
ALTER TABLE "new_AdministrativeClass" RENAME TO "AdministrativeClass";
CREATE UNIQUE INDEX "AdministrativeClass_name_key" ON "AdministrativeClass"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_HeadTeachers_AB_unique" ON "_HeadTeachers"("A", "B");

-- CreateIndex
CREATE INDEX "_HeadTeachers_B_index" ON "_HeadTeachers"("B");
