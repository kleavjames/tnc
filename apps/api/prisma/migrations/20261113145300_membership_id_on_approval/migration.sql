-- Existing membership IDs stay as they are. New rows stay null until approval.
ALTER TABLE "members" ALTER COLUMN "membershipId" DROP DEFAULT;
ALTER TABLE "members" ALTER COLUMN "membershipId" DROP NOT NULL;
