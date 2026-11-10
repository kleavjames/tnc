-- CreateSequence
CREATE SEQUENCE "membership_id_seq" START WITH 1 INCREMENT BY 1;

-- CreateFunction
CREATE FUNCTION tnc_membership_id() RETURNS TEXT
LANGUAGE sql
VOLATILE
AS $$
  SELECT 'TNC-' || LPAD(nextval('membership_id_seq')::text, 5, '0') || '-' || TO_CHAR(CURRENT_DATE, 'YY');
$$;

-- AlterTable
ALTER TABLE "members" ADD COLUMN "membershipId" TEXT NOT NULL DEFAULT tnc_membership_id();

-- CreateIndex
CREATE UNIQUE INDEX "members_membershipId_key" ON "members"("membershipId");
