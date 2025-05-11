
-- CreateTable
CREATE TABLE "FontConfiguration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "assignedLanguage" TEXT NOT NULL,
    "characters" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "downloadURL" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "FontConfiguration_assignedLanguage_idx" ON "FontConfiguration"("assignedLanguage");

-- CreateIndex
CREATE INDEX "FontConfiguration_createdAt_idx" ON "FontConfiguration"("createdAt");
