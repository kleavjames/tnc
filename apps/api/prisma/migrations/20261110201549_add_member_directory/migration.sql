-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "CivilStatus" AS ENUM ('single', 'married', 'widowed', 'separated');

-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "church_branches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "church_branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dgroup_meetings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "days" "Weekday"[],
    "time" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dgroup_meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "email" TEXT,
    "messengerName" TEXT,
    "birthdate" DATE NOT NULL,
    "gender" "Gender" NOT NULL,
    "civilStatus" "CivilStatus" NOT NULL,
    "branchId" TEXT NOT NULL,
    "isDgroupLeader" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DgroupMeetingToMember" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DgroupMeetingToMember_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_MemberToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MemberToRole_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "church_branches_name_branch_key" ON "church_branches"("name", "branch");

-- CreateIndex
CREATE INDEX "members_branchId_idx" ON "members"("branchId");

-- CreateIndex
CREATE INDEX "_DgroupMeetingToMember_B_index" ON "_DgroupMeetingToMember"("B");

-- CreateIndex
CREATE INDEX "_MemberToRole_B_index" ON "_MemberToRole"("B");

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "church_branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DgroupMeetingToMember" ADD CONSTRAINT "_DgroupMeetingToMember_A_fkey" FOREIGN KEY ("A") REFERENCES "dgroup_meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DgroupMeetingToMember" ADD CONSTRAINT "_DgroupMeetingToMember_B_fkey" FOREIGN KEY ("B") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MemberToRole" ADD CONSTRAINT "_MemberToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MemberToRole" ADD CONSTRAINT "_MemberToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
