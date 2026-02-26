-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AdministrativeClass" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "headTeacherId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AdministrativeClass_headTeacherId_fkey" FOREIGN KEY ("headTeacherId") REFERENCES "Teacher" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AdministrativeClass" ("createdAt", "id", "name", "updatedAt") SELECT "createdAt", "id", "name", "updatedAt" FROM "AdministrativeClass";
DROP TABLE "AdministrativeClass";
ALTER TABLE "new_AdministrativeClass" RENAME TO "AdministrativeClass";
CREATE UNIQUE INDEX "AdministrativeClass_name_key" ON "AdministrativeClass"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
