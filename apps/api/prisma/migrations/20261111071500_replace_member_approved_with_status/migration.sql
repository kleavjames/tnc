-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('pending', 'approved', 'reject');

-- AlterTable
ALTER TABLE "members" ADD COLUMN "status" "MemberStatus" NOT NULL DEFAULT 'pending';

UPDATE "members" SET "status" = 'approved' WHERE "approved" = true;

ALTER TABLE "members" DROP COLUMN "approved";
