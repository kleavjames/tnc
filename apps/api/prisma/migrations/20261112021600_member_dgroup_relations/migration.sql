-- Copy the implicit member link onto the meeting as its leader before the
-- join table is dropped. Those rows are the member who created the meeting,
-- not an attendee, so members.dgroupMeetingId stays null.

ALTER TABLE "dgroup_meetings" ADD COLUMN "leaderId" TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "dgroup_meetings" AS meeting
    LEFT JOIN "_DgroupMeetingToMember" AS link ON link."A" = meeting."id"
    GROUP BY meeting."id"
    HAVING count(link."B") <> 1
  ) THEN
    RAISE EXCEPTION 'each dgroup meeting must link exactly one member before it can have a leader';
  END IF;
END $$;

UPDATE "dgroup_meetings" AS meeting
SET "leaderId" = link."B"
FROM "_DgroupMeetingToMember" AS link
WHERE link."A" = meeting."id";

ALTER TABLE "dgroup_meetings" ALTER COLUMN "leaderId" SET NOT NULL;

-- AlterTable
ALTER TABLE "members" ADD COLUMN "baptism" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "dgroupMeetingId" TEXT,
ADD COLUMN "preTrueLife" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "trueLife" BOOLEAN NOT NULL DEFAULT false;

-- DropForeignKey
ALTER TABLE "_DgroupMeetingToMember" DROP CONSTRAINT "_DgroupMeetingToMember_A_fkey";

-- DropForeignKey
ALTER TABLE "_DgroupMeetingToMember" DROP CONSTRAINT "_DgroupMeetingToMember_B_fkey";

-- DropTable
DROP TABLE "_DgroupMeetingToMember";

-- CreateIndex
CREATE INDEX "dgroup_meetings_leaderId_idx" ON "dgroup_meetings"("leaderId");

-- CreateIndex
CREATE INDEX "members_dgroupMeetingId_idx" ON "members"("dgroupMeetingId");

-- AddForeignKey
ALTER TABLE "dgroup_meetings" ADD CONSTRAINT "dgroup_meetings_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_dgroupMeetingId_fkey" FOREIGN KEY ("dgroupMeetingId") REFERENCES "dgroup_meetings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
