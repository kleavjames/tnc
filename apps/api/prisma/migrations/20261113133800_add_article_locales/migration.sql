-- CreateEnum
CREATE TYPE "ArticleLanguage" AS ENUM ('english', 'tagalog', 'cebuano');

-- CreateTable
CREATE TABLE "article_locales" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "language" "ArticleLanguage" NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "verse" TEXT NOT NULL,
    "articleStatus" "ArticleStatus" NOT NULL DEFAULT 'draft',
    "fileKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_locales_pkey" PRIMARY KEY ("id")
);

-- Existing articles become the required English locale.
INSERT INTO "article_locales" (
    "id",
    "articleId",
    "language",
    "title",
    "subtitle",
    "body",
    "verse",
    "articleStatus",
    "fileKey",
    "createdAt",
    "updatedAt"
)
SELECT
    "id" || ':english',
    "id",
    'english',
    "title",
    "subtitle",
    "body",
    "verse",
    "articleStatus",
    "fileKey",
    "createdAt",
    "updatedAt"
FROM "articles";

-- CreateIndex
CREATE INDEX "article_locales_language_articleStatus_idx" ON "article_locales"("language", "articleStatus");

-- CreateIndex
CREATE UNIQUE INDEX "article_locales_articleId_language_key" ON "article_locales"("articleId", "language");

-- AddForeignKey
ALTER TABLE "article_locales" ADD CONSTRAINT "article_locales_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "articles" DROP COLUMN "title",
DROP COLUMN "subtitle",
DROP COLUMN "body",
DROP COLUMN "verse",
DROP COLUMN "articleStatus",
DROP COLUMN "fileKey";
