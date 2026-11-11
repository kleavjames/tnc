-- CreateTable
CREATE TABLE "glcs" (
    "id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "glcs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "glc_books" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "glcId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "glc_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "glc_sessions" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "glc_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "glc_progress" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "glc_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "glc_progress_sessions" (
    "id" TEXT NOT NULL,
    "progressId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "glc_progress_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "glcs_level_key" ON "glcs"("level");

-- CreateIndex
CREATE UNIQUE INDEX "glc_books_glcId_number_key" ON "glc_books"("glcId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "glc_sessions_bookId_number_key" ON "glc_sessions"("bookId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "glc_progress_memberId_key" ON "glc_progress"("memberId");

-- CreateIndex
CREATE INDEX "glc_progress_sessions_sessionId_idx" ON "glc_progress_sessions"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "glc_progress_sessions_progressId_sessionId_key" ON "glc_progress_sessions"("progressId", "sessionId");

-- AddForeignKey
ALTER TABLE "glc_books" ADD CONSTRAINT "glc_books_glcId_fkey" FOREIGN KEY ("glcId") REFERENCES "glcs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "glc_sessions" ADD CONSTRAINT "glc_sessions_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "glc_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "glc_progress" ADD CONSTRAINT "glc_progress_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "glc_progress_sessions" ADD CONSTRAINT "glc_progress_sessions_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "glc_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "glc_progress_sessions" ADD CONSTRAINT "glc_progress_sessions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "glc_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
