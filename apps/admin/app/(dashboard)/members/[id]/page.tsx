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
  branchLabel,
  formatMemberDate,
  labelize,
  memberName,
} from "@/lib/member-display";
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
  const member = await getMember(id);
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

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <Section title="Personal">
            <Field label="First name" value={member.firstName} />
            <Field label="Last name" value={member.lastName} />
            <Field
              label="Birthdate"
              value={formatMemberDate(member.birthdate)}
            />
            <Field label="Gender" value={labelize(member.gender)} />
            <Field label="Civil status" value={labelize(member.civilStatus)} />
          </Section>

          <Section title="Contact">
            <Field label="Mobile" value={member.mobileNumber} />
            <Field label="Email" value={member.email} />
            <Field label="Messenger" value={member.messengerName} />
          </Section>
        </div>

        <Section title="Church">
          <Field label="Branch" value={branchLabel(member.branch)} />
          <Field
            label="Dgroup leader"
            value={member.isDgroupLeader ? "Yes" : "No"}
          />
          <Field label="Dgroup" value={attendedLabel(member.dgroupMeeting)} />
          <Field label="Pre-True Life" value={yesNo(member.preTrueLife)} />
          <Field label="True Life" value={yesNo(member.trueLife)} />
          <Field label="Baptism" value={yesNo(member.baptism)} />
          <Field label="Roles" value={member.roles.join(", ")} />
          <Field label="Registered" value={formatMemberDate(member.createdAt)} />
        </Section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold tracking-tight">Dgroup meetings</h2>
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
        </section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <dl className="flex flex-col border-t">{children}</dl>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="grid gap-1 border-b py-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 font-semibold break-words">
        {value ? (
          value
        ) : (
          <span className="font-normal text-muted-foreground">—</span>
        )}
      </dd>
    </div>
  );
}

function yesNo(value: boolean): string {
  return value ? "Yes" : "No";
}

function attendedLabel(meeting: Member["dgroupMeeting"]): string | null {
  if (!meeting) {
    return null;
  }
  const days = meeting.days.map(labelize).join(", ");
  return [meeting.name, days, meeting.time].filter(Boolean).join(" · ");
}

function initials(member: Pick<Member, "firstName" | "lastName">): string {
  return `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`.toUpperCase();
}
