"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Card, CardContent } from "@repo/ui/components/card";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Input } from "@repo/ui/components/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@repo/ui/components/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { ChoiceGroup } from "@repo/ui/choice-group";
import { cn } from "@repo/ui/lib/utils";
import { memberName } from "@/lib/member-display";
import type {
  GlcAttendance,
  GlcAttendanceBook,
  GlcAttendanceLevel,
  GlcAttendanceMember,
  GlcAttendanceSession,
} from "@/lib/glc-progress";
import { toast } from "sonner";

const ALL = "all";
const MEMBER_COLUMN = "14rem";
const PROGRESS_COLUMN = "8rem";

const PAGE_SIZES = [25, 50, 75, 100] as const;

type PageSize = (typeof PAGE_SIZES)[number];

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
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState<PageSize>(25);
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
  const books = visibleBooks(levels);
  const sessions = books.flatMap((column) => column.sessions);
  const branches = branchOptions(attendance.members);
  const visibleMembers = attendance.members
    .filter((member) => branchId === ALL || member.branch.id === branchId)
    .filter((member) => matchesName(member, query))
    .slice()
    .sort(byName);
  const stats = summarize(visibleMembers, sessions, overrides);
  const pageCount = Math.max(1, Math.ceil(visibleMembers.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * pageSize;
  const pageMembers = visibleMembers.slice(pageStart, pageStart + pageSize);

  function showPage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), pageCount));
  }

  function changePageSize(nextSize: string) {
    const size = PAGE_SIZES.find((item) => String(item) === nextSize);
    if (!size) {
      return;
    }
    setPageSize(size);
    setPage(1);
  }

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
          onChange={(value) => {
            setBranchId(value);
            setPage(1);
          }}
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {attendance.members.length === 0 ? (
        <p className="rounded-md border border-dashed bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          No members have started GLC.
        </p>
      ) : (
        <div className="overflow-hidden rounded-md border bg-card">
          <Table className="border-separate border-spacing-0">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead
                  colSpan={2}
                  style={lockedColumn(`calc(${MEMBER_COLUMN} + ${PROGRESS_COLUMN})`)}
                  className="sticky left-0 z-30 border-r border-b border-foreground bg-foreground text-background"
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
                <TableHead
                  colSpan={2}
                  style={lockedColumn(`calc(${MEMBER_COLUMN} + ${PROGRESS_COLUMN})`)}
                  className="sticky left-0 z-30 h-auto border-r border-b bg-primary/15 py-2"
                >
                  <div className="relative">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(event) => {
                        setQuery(event.target.value);
                        setPage(1);
                      }}
                      placeholder="Search names..."
                      aria-label="Search names"
                      className="bg-card pl-8"
                    />
                  </div>
                </TableHead>
                {books.map((column) => (
                  <TableHead
                    key={column.book.id}
                    colSpan={column.sessions.length}
                    title={column.book.title}
                    className={cn(
                      "border-r border-b text-center font-bold text-primary whitespace-normal",
                      bookTone(column.index),
                    )}
                  >
                    Book {column.book.number}
                  </TableHead>
                ))}
              </TableRow>
              <TableRow className="hover:bg-transparent">
                <TableHead
                  style={lockedColumn(MEMBER_COLUMN)}
                  className="sticky left-0 z-20 border-b bg-card text-xs font-bold tracking-wide text-muted-foreground uppercase"
                >
                  Member
                </TableHead>
                <TableHead
                  style={{
                    ...lockedColumn(PROGRESS_COLUMN),
                    left: MEMBER_COLUMN,
                  }}
                  className="sticky z-20 border-r border-b bg-card text-xs font-bold tracking-wide text-muted-foreground uppercase shadow-[4px_0_8px_-6px_rgba(0,0,0,0.28)]"
                >
                  Progress
                </TableHead>
                {books.flatMap((column) =>
                  column.sessions.map((session, sessionIndex) => (
                    <TableHead
                      key={session.id}
                      title={session.title}
                      className={cn(
                        "min-w-16 border-b px-1 text-center text-xs font-medium whitespace-normal text-muted-foreground",
                        bookTone(column.index),
                        sessionIndex === column.sessions.length - 1 &&
                          "border-r",
                      )}
                    >
                      Session
                      <span className="block">{session.number}</span>
                    </TableHead>
                  )),
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleMembers.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={2}
                    style={lockedColumn(
                      `calc(${MEMBER_COLUMN} + ${PROGRESS_COLUMN})`,
                    )}
                    className="sticky left-0 z-10 border-r bg-card text-sm whitespace-normal text-muted-foreground"
                  >
                    {emptyMembersMessage(query, branchId !== ALL)}
                  </TableCell>
                </TableRow>
              ) : null}
              {pageMembers.map((member) => {
                const attended = countAttended(member, sessions, overrides);
                const total = sessions.length;
                const percent =
                  total === 0 ? 0 : Math.round((attended / total) * 100);
                return (
                  <TableRow
                    key={member.id}
                    className="group hover:bg-transparent"
                  >
                    <TableCell
                      style={lockedColumn(MEMBER_COLUMN)}
                      className="sticky left-0 z-10 bg-card whitespace-normal group-hover:bg-muted/50"
                    >
                      <div className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
                        <Avatar>
                          <AvatarFallback className={avatarTone(member.id)}>
                            {initials(member)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <Link
                            href={`/members/${member.id}`}
                            title={memberName(member)}
                            className="block font-semibold hover:underline"
                          >
                            <MarqueeName name={memberName(member)} />
                          </Link>
                          <p className="truncate text-xs text-muted-foreground">
                            {member.branch.branch}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell
                      style={{
                        ...lockedColumn(PROGRESS_COLUMN),
                        left: MEMBER_COLUMN,
                      }}
                      className="sticky z-10 border-r bg-card shadow-[4px_0_8px_-6px_rgba(0,0,0,0.28)] group-hover:bg-muted/50"
                    >
                      <div className="flex w-full flex-col gap-1">
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
                    {books.flatMap((column) =>
                      column.sessions.map((session, sessionIndex) => {
                        const checked = isAttended(
                          member,
                          session.id,
                          overrides,
                        );
                        const key = `${member.id}:${session.id}`;
                        return (
                          <TableCell
                            key={session.id}
                            className={cn(
                              "text-center",
                              bookTone(column.index),
                              sessionIndex === column.sessions.length - 1 &&
                                "border-r",
                            )}
                          >
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
                      }),
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {attendance.members.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {visibleMembers.length === 0
              ? `Showing 0 members · ${sessions.length} sessions`
              : `Showing ${pageStart + 1}–${pageStart + pageMembers.length} of ${visibleMembers.length} members · ${sessions.length} sessions`}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {visibleMembers.length > 0 ? (
              <>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Rows</p>
                  <ChoiceGroup
                    id="glc-page-size"
                    label="Rows per page"
                    size="xs"
                    value={String(pageSize)}
                    options={PAGE_SIZES.map((size) => ({
                      value: String(size),
                      label: String(size),
                    }))}
                    onChange={changePageSize}
                  />
                </div>
                <AttendancePagination
                  page={currentPage}
                  pageCount={pageCount}
                  onPageChange={showPage}
                />
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AttendancePagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <Pagination className="mx-0 w-auto justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={page === 1}
            className={
              page === 1 ? "pointer-events-none opacity-50" : undefined
            }
            onClick={(event) => {
              event.preventDefault();
              onPageChange(page - 1);
            }}
          />
        </PaginationItem>
        {pageList(page, pageCount).map((item, index) => (
          <PaginationItem
            key={item === "ellipsis" ? `ellipsis-${index}` : item}
          >
            {item === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href="#"
                isActive={item === page}
                onClick={(event) => {
                  event.preventDefault();
                  onPageChange(item);
                }}
              >
                {item}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={page === pageCount}
            className={
              page === pageCount ? "pointer-events-none opacity-50" : undefined
            }
            onClick={(event) => {
              event.preventDefault();
              onPageChange(page + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function pageList(page: number, pageCount: number): Array<number | "ellipsis"> {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const items: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);
  if (start > 2) {
    items.push("ellipsis");
  }
  for (let number = start; number <= end; number += 1) {
    items.push(number);
  }
  if (end < pageCount - 1) {
    items.push("ellipsis");
  }
  items.push(pageCount);
  return items;
}

function lockedColumn(width: string): React.CSSProperties {
  return { width, minWidth: width, maxWidth: width };
}

function MarqueeName({ name }: { name: string }) {
  const frameRef = React.useRef<HTMLSpanElement>(null);
  const labelRef = React.useRef<HTMLSpanElement>(null);
  const [duration, setDuration] = React.useState(0);

  React.useEffect(() => {
    const frame = frameRef.current;
    const label = labelRef.current;
    if (!frame || !label) {
      return;
    }

    const measure = () => {
      if (frame.clientWidth === 0) {
        return;
      }
      const overflow = label.scrollWidth - frame.clientWidth;
      const seconds = (label.scrollWidth + 32) / 36;
      setDuration(overflow > 1 ? Math.min(20, Math.max(8, seconds)) : 0);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [name]);

  const scrolling = duration > 0;

  return (
    <span ref={frameRef} className="block overflow-hidden">
      <span
        className={cn(
          "inline-flex w-max whitespace-nowrap",
          scrolling &&
            "hover:[animation-play-state:paused] motion-safe:[animation:member-marquee_linear_infinite]",
        )}
        style={scrolling ? { animationDuration: `${duration}s` } : undefined}
      >
        <span ref={labelRef} className={cn(scrolling && "pr-8")}>
          {name}
        </span>
        {scrolling ? (
          <span aria-hidden className="pr-8">
            {name}
          </span>
        ) : null}
      </span>
    </span>
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

function visibleBooks(levels: GlcAttendanceLevel[]): {
  book: GlcAttendanceBook;
  index: number;
  sessions: GlcAttendanceSession[];
}[] {
  const columns: {
    book: GlcAttendanceBook;
    index: number;
    sessions: GlcAttendanceSession[];
  }[] = [];
  for (const level of levels) {
    for (const book of level.books) {
      if (book.sessions.length === 0) {
        continue;
      }
      columns.push({
        book,
        index: columns.length,
        sessions: book.sessions,
      });
    }
  }
  return columns;
}

function bookTone(index: number): string {
  return index % 2 === 0 ? "bg-white" : "bg-muted/10";
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

function matchesName(member: GlcAttendanceMember, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }
  return memberName(member).toLowerCase().includes(normalized);
}

function emptyMembersMessage(query: string, branchFiltered: boolean): string {
  if (query.trim() && !branchFiltered) {
    return "No members match this search.";
  }
  return "No members match these filters.";
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
