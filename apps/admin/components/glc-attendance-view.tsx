"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Card, CardContent } from "@repo/ui/components/card";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { ChoiceGroup } from "@repo/ui/choice-group";
import { memberName } from "@/lib/member-display";
import type {
  GlcAttendance,
  GlcAttendanceLevel,
  GlcAttendanceMember,
  GlcAttendanceSession,
} from "@/lib/glc-progress";
import { toast } from "sonner";

const ALL = "all";

const AVATAR_TONES = [
  "bg-primary text-primary-foreground",
  "bg-foreground/75 text-background",
  "bg-primary/70 text-primary-foreground",
  "bg-foreground/55 text-background",
  "bg-primary/45 text-foreground",
] as const;

export function GlcAttendanceView({
  attendance,
}: {
  attendance: GlcAttendance;
}) {
  const router = useRouter();
  const [levelId, setLevelId] = React.useState(ALL);
  const [branchId, setBranchId] = React.useState(ALL);
  const [overrides, setOverrides] = React.useState<
    Record<string, Record<string, boolean>>
  >({});
  const [savingKey, setSavingKey] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setOverrides({});
  }, [attendance]);

  const levels =
    levelId === ALL
      ? attendance.levels
      : attendance.levels.filter((level) => level.id === levelId);
  const sessions = sessionsIn(levels);
  const branches = branchOptions(attendance.members);
  const visibleMembers = attendance.members
    .filter((member) => branchId === ALL || member.branch.id === branchId)
    .slice()
    .sort(byName);
  const stats = summarize(visibleMembers, sessions, overrides);

  async function setAttended(
    member: GlcAttendanceMember,
    sessionId: string,
    attended: boolean,
  ) {
    const key = `${member.id}:${sessionId}`;
    setSavingKey(key);
    setError(null);
    setOverrides((current) => ({
      ...current,
      [member.id]: { ...current[member.id], [sessionId]: attended },
    }));
    try {
      const response = await fetch(sessionPath(member.id, sessionId), {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ attended }),
      });
      if (!response.ok) {
        throw new Error(
          await readError(response, "Could not update attendance."),
        );
      }
      toast.success("Progress updated.");
      router.refresh();
    } catch (err) {
      setOverrides((current) => {
        const memberOverrides = { ...current[member.id] };
        delete memberOverrides[sessionId];
        return { ...current, [member.id]: memberOverrides };
      });
      setError(
        err instanceof Error ? err.message : "Could not update attendance.",
      );
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6 bg-background p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">
            GLC
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            Global Leadership Center
          </h1>
          <p className="text-sm text-muted-foreground">
            This is the general overview of the leader's progress in the Global
            Leadership Center.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <StatCard label="Members" value={String(stats.members)} />
          <StatCard label="Avg. progress" value={`${stats.average}%`} />
          <StatCard label="Completed" value={String(stats.completed)} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <FilterPills
          label="Level"
          value={levelId}
          options={[
            { value: ALL, label: "All levels" },
            ...attendance.levels.map((level) => ({
              value: level.id,
              label: level.name,
            })),
          ]}
          onChange={setLevelId}
        />
        <FilterPills
          label="Branch"
          value={branchId}
          options={[{ value: ALL, label: "All" }, ...branches]}
          onChange={setBranchId}
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {visibleMembers.length === 0 ? (
        <p className="rounded-md border border-dashed bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          {attendance.members.length === 0
            ? "No members have started GLC."
            : "No members match these filters."}
        </p>
      ) : (
        <div className="overflow-hidden rounded-md border bg-card">
          <Table className="border-separate border-spacing-0">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead
                  colSpan={2}
                  rowSpan={2}
                  className="sticky left-0 z-30 w-88 min-w-88 border-r border-b border-foreground bg-foreground text-background"
                >
                  <span className="text-xs font-bold tracking-[0.16em] uppercase">
                    Curriculum
                  </span>
                </TableHead>
                {levels.map((level) => {
                  const count = sessionCount(level);
                  if (count === 0) {
                    return null;
                  }
                  return (
                    <TableHead
                      key={level.id}
                      colSpan={count}
                      title={level.title}
                      className="border-r border-b border-foreground/80 bg-foreground text-center text-background"
                    >
                      <span className="text-xs font-bold tracking-[0.14em] uppercase">
                        {level.name}
                      </span>
                    </TableHead>
                  );
                })}
              </TableRow>
              <TableRow className="hover:bg-transparent">
                {levels.flatMap((level) =>
                  level.books.map((book) =>
                    book.sessions.length === 0 ? null : (
                      <TableHead
                        key={book.id}
                        colSpan={book.sessions.length}
                        title={book.title}
                        className="border-r border-b bg-primary/15 text-center font-semibold whitespace-normal"
                      >
                        Book {book.number}
                      </TableHead>
                    ),
                  ),
                )}
              </TableRow>
              <TableRow className="hover:bg-transparent">
                <TableHead className="sticky left-0 z-20 w-56 min-w-56 border-b bg-card text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Member
                </TableHead>
                <TableHead className="sticky left-56 z-20 w-32 min-w-32 border-r border-b bg-card text-xs font-bold tracking-wide text-muted-foreground uppercase shadow-[4px_0_8px_-6px_rgba(0,0,0,0.28)]">
                  Progress
                </TableHead>
                {sessions.map((session) => (
                  <TableHead
                    key={session.id}
                    title={session.title}
                    className="min-w-16 border-b px-1 text-center text-xs font-medium whitespace-normal text-muted-foreground"
                  >
                    Session
                    <span className="block">{session.number}</span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleMembers.map((member) => {
                const attended = countAttended(member, sessions, overrides);
                const total = sessions.length;
                const percent =
                  total === 0 ? 0 : Math.round((attended / total) * 100);
                return (
                  <TableRow
                    key={member.id}
                    className="group hover:bg-transparent"
                  >
                    <TableCell className="sticky left-0 z-10 w-56 min-w-56 bg-card group-hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className={avatarTone(member.id)}>
                            {initials(member)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <Link
                            href={`/members/${member.id}`}
                            className="block truncate font-semibold hover:underline"
                          >
                            {memberName(member)}
                          </Link>
                          <p className="truncate text-xs text-muted-foreground">
                            {member.branch.branch}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="sticky left-56 z-10 w-32 min-w-32 border-r bg-card shadow-[4px_0_8px_-6px_rgba(0,0,0,0.28)] group-hover:bg-muted/50">
                      <div className="flex min-w-24 flex-col gap-1">
                        <span className="text-sm font-medium">
                          {attended}/{total}
                        </span>
                        <span className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <span
                            className="block h-full rounded-full bg-primary"
                            style={{ width: `${percent}%` }}
                          />
                        </span>
                      </div>
                    </TableCell>
                    {sessions.map((session) => {
                      const checked = isAttended(member, session.id, overrides);
                      const key = `${member.id}:${session.id}`;
                      return (
                        <TableCell key={session.id} className="text-center">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={checked}
                              disabled={savingKey === key}
                              aria-label={`${memberName(member)}, ${session.title}`}
                              onCheckedChange={(value) =>
                                void setAttended(
                                  member,
                                  session.id,
                                  value === true,
                                )
                              }
                            />
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {visibleMembers.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>
            Showing {visibleMembers.length} members · {sessions.length} sessions
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="size-3.5 rounded-[4px] bg-primary" />
              Done
            </span>
            <span className="flex items-center gap-2">
              <span className="size-3.5 rounded-[4px] border border-input bg-card" />
              Not yet
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm" className="min-w-28">
      <CardContent className="flex flex-col gap-1">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          {label}
        </p>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

function FilterPills({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
      <ChoiceGroup
        id={`glc-${label}`}
        label={label}
        value={value}
        options={options}
        onChange={onChange}
      />
    </div>
  );
}

function sessionsIn(levels: GlcAttendanceLevel[]): GlcAttendanceSession[] {
  return levels.flatMap((level) =>
    level.books.flatMap((book) => book.sessions),
  );
}

function sessionCount(level: GlcAttendanceLevel): number {
  return level.books.reduce((sum, book) => sum + book.sessions.length, 0);
}

function branchOptions(
  members: GlcAttendanceMember[],
): { value: string; label: string }[] {
  const byId = new Map<string, string>();
  for (const member of members) {
    byId.set(member.branch.id, member.branch.branch);
  }
  return [...byId.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function byName(a: GlcAttendanceMember, b: GlcAttendanceMember): number {
  return (
    a.lastName.localeCompare(b.lastName) ||
    a.firstName.localeCompare(b.firstName)
  );
}

function summarize(
  members: GlcAttendanceMember[],
  sessions: GlcAttendanceSession[],
  overrides: Record<string, Record<string, boolean>>,
): { members: number; average: number; completed: number } {
  const possible = members.length * sessions.length;
  let checks = 0;
  let completed = 0;
  for (const member of members) {
    const attended = countAttended(member, sessions, overrides);
    checks += attended;
    if (sessions.length > 0 && attended === sessions.length) {
      completed += 1;
    }
  }
  return {
    members: members.length,
    average: possible === 0 ? 0 : Math.round((checks / possible) * 100),
    completed,
  };
}

function countAttended(
  member: GlcAttendanceMember,
  sessions: GlcAttendanceSession[],
  overrides: Record<string, Record<string, boolean>>,
): number {
  return sessions.reduce(
    (count, session) =>
      count + (isAttended(member, session.id, overrides) ? 1 : 0),
    0,
  );
}

function isAttended(
  member: GlcAttendanceMember,
  sessionId: string,
  overrides: Record<string, Record<string, boolean>>,
): boolean {
  const override = overrides[member.id]?.[sessionId];
  if (override !== undefined) {
    return override;
  }
  return member.attendedSessionIds.includes(sessionId);
}

function initials(member: GlcAttendanceMember): string {
  return `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`.toUpperCase();
}

function avatarTone(id: string): string {
  let hash = 0;
  for (const char of id) {
    hash = (hash + char.charCodeAt(0)) % AVATAR_TONES.length;
  }
  return AVATAR_TONES[hash] ?? AVATAR_TONES[0];
}

function sessionPath(memberId: string, sessionId: string): string {
  return `/api/glc/members/${encodeURIComponent(memberId)}/sessions/${encodeURIComponent(sessionId)}`;
}

async function readError(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = (await response.json()) as { message?: unknown };
    if (typeof body.message === "string") {
      return body.message;
    }
    if (Array.isArray(body.message)) {
      return body.message.join(", ");
    }
  } catch {
    // status line only
  }
  return fallback;
}
