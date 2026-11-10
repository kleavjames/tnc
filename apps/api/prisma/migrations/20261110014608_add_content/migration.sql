-- CreateTable
CREATE TABLE "content" (
    "id" TEXT NOT NULL DEFAULT 'site',
    "latestSermon" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_pkey" PRIMARY KEY ("id")
);
