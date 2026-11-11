import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { GlcMemberView } from "@/components/glc-member-view";
import { MemberPersonalTab } from "@/components/member-personal-tab";
import { labelize, memberName } from "@/lib/member-display";
import { listChurchBranches } from "@/lib/church-branches";
import { getGlcProgress } from "@/lib/glc";
import { getMember, type Member } from "@/lib/members";

export const metadata: Metadata = {
  title: "Member",
};

export default async function MemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [member, branches, progress] = await Promise.all([
    getMember(id),
    listChurchBranches(),
    getGlcProgress(id),
  ]);
  if (!member) {
    notFound();
  }

  const pending = member.status === "pending";

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 lg:p-8">
      <div>
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link href={pending ? "/members/pending" : "/members"} />}
        >
          {pending ? "Pending registrations" : "Members"}
        </Button>
      </div>

      <div className="flex max-w-5xl flex-col gap-10">
        <header className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="text-lg font-medium">
              {initials(member)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="text-3xl font-bold tracking-tight">
                {memberName(member)}
              </h1>
              <Badge variant={pending ? "secondary" : "default"}>
                {pending ? "Pending" : labelize(member.status)}
              </Badge>
            </div>
            <p className="text-muted-foreground">{member.membershipId}</p>
          </div>
        </header>

        <Tabs defaultValue="personal" className="gap-8">
          <TabsList variant="line" className="gap-2">
            <TabsTrigger value="personal">Personal Information</TabsTrigger>
            <TabsTrigger value="dgroup">Dgroup Meetings</TabsTrigger>
            <TabsTrigger value="glc">GLC Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="flex flex-col gap-10">
            <MemberPersonalTab member={member} branches={branches} />
          </TabsContent>

          <TabsContent value="dgroup">
            {member.dgroupMeetings.length === 0 ? (
              <p className="rounded-md border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                No dgroup meetings.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold text-muted-foreground">
                        Name
                      </TableHead>
                      <TableHead className="font-bold text-muted-foreground">
                        Days
                      </TableHead>
                      <TableHead className="font-bold text-muted-foreground">
                        Time
                      </TableHead>
                      <TableHead className="font-bold text-muted-foreground">
                        Description
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {member.dgroupMeetings.map((meeting) => (
                      <TableRow key={meeting.id}>
                        <TableCell className="font-semibold">
                          {meeting.name}
                        </TableCell>
                        <TableCell className="font-medium">
                          {meeting.days.map(labelize).join(", ") || "—"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {meeting.time}
                        </TableCell>
                        <TableCell className="max-w-xs whitespace-normal text-muted-foreground">
                          {meeting.description || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="glc">
            <GlcMemberView memberId={member.id} progress={progress} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function initials(member: Pick<Member, "firstName" | "lastName">): string {
  return `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`.toUpperCase();
}
