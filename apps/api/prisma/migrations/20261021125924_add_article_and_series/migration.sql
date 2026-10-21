-- CreateEnum
CREATE TYPE "ArticleType" AS ENUM ('glc', 'lnl', 'sermon');

-- CreateTable
CREATE TABLE "series" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "verse" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "type" "ArticleType" NOT NULL,
    "imageKey" TEXT,
    "fileKey" TEXT,
    "seriesId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "articles_type_idx" ON "articles"("type");

-- CreateIndex
CREATE INDEX "articles_uploadedAt_idx" ON "articles"("uploadedAt");

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "series"("id") ON DELETE SET NULL ON UPDATE CASCADE;
