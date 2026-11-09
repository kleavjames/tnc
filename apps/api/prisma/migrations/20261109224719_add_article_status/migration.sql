-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('draft', 'unpublish', 'published');

-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "articleStatus" "ArticleStatus" NOT NULL DEFAULT 'draft';
