"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontalIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/components/input-group";
import { Modal } from "@repo/ui/modal";
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
import { branchLabel, memberName } from "../lib/member-display";
import type { Member } from "../lib/members";

const ALL = "all";

const GENDERS = [
  { value: ALL, label: "All" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
] as const;

const DGROUP_LEADERS = [
  { value: ALL, label: "All" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const;

const CIVIL_STATUSES = [
  { value: ALL, label: "All" },
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "widowed", label: "Widowed" },
  { value: "separated", label: "Separated" },
] as const;

const PAGE_SIZES = [25, 50, 75, 100] as const;

type PageSize = (typeof PAGE_SIZES)[number];

export function MembersView({
  members,
  pendingCount,
}: {
  members: Member[];
  pendingCount: number;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [branchId, setBranchId] = React.useState(ALL);
  const [gender, setGender] =
    React.useState<(typeof GENDERS)[number]["value"]>(ALL);
  const [dgroupLeader, setDgroupLeader] =
    React.useState<(typeof DGROUP_LEADERS)[number]["value"]>(ALL);
  const [civilStatus, setCivilStatus] =
    React.useState<(typeof CIVIL_STATUSES)[number]["value"]>(ALL);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState<PageSize>(25);
  const branches = churchBranches(members);
  const filters = { branchId, gender, dgroupLeader, civilStatus };
  const visibleMembers = filterMembers(members, query, filters);
  const filtersActive = Object.values(filters).some((value) => value !== ALL);
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

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">
            Church directory
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
        </div>
        <Button
          size="lg"
          className="shrink-0"
          nativeButton={false}
          render={<Link href="/members/pending" />}
        >
          Pending registrations
          {pendingCount > 0 ? (
            <Badge variant="secondary">{pendingCount}</Badge>
          ) : null}
        </Button>
      </div>

      {members.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <InputGroup className="w-full max-w-sm justify-self-start rounded-md sm:col-span-3">
                <InputGroupInput
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search name, mobile, or ID..."
                />
                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div className="flex flex-wrap gap-x-10 gap-y-4">
              {branches.length > 0 ? (
                <FilterGroup
                  id="member-branch"
                  label="Branch"
                  value={branchId}
                  options={[
                    { value: ALL, label: "All" },
                    ...branches.map((branch) => ({
                      value: branch.id,
                      label: branch.branch,
                    })),
                  ]}
                  onChange={(value) => {
                    setBranchId(value);
                    setPage(1);
                  }}
                />
              ) : null}
              <FilterGroup
                id="member-gender"
                label="Gender"
                value={gender}
                options={GENDERS}
                onChange={(value) => {
                  setGender(value);
                  setPage(1);
                }}
              />
              <FilterGroup
                id="member-dgroup-leader"
                label="Dgroup leader"
                value={dgroupLeader}
                options={DGROUP_LEADERS}
                onChange={(value) => {
                  setDgroupLeader(value);
                  setPage(1);
                }}
              />
              <FilterGroup
                id="member-civil-status"
                label="Civil status"
                value={civilStatus}
                options={CIVIL_STATUSES}
                onChange={(value) => {
                  setCivilStatus(value);
                  setPage(1);
                }}
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {visibleMembers.length === 0 ? (
        <p className="rounded-md border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          {emptyMembersMessage(members.length, query, filtersActive)}
        </p>
      ) : (
        <div className="min-w-0 overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-muted-foreground">
                  Membership ID
                </TableHead>
                <TableHead className="font-bold text-muted-foreground">
                  Name
                </TableHead>
                <TableHead className="font-bold text-muted-foreground">
                  Mobile
                </TableHead>
                <TableHead className="font-bold text-muted-foreground">
                  Email
                </TableHead>
                <TableHead className="font-bold text-muted-foreground">
                  Branch
                </TableHead>
                <TableHead className="font-bold text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageMembers.map((member) => (
                <TableRow
                  key={member.id}
                  className="group cursor-pointer"
                  onClick={() => {
                    if (window.getSelection()?.toString()) {
                      return;
                    }
                    router.push(`/members/${member.id}`);
                  }}
                >
                  <TableCell className="font-medium">
                    {member.membershipId}
                  </TableCell>
                  <TableCell>{memberName(member)}</TableCell>
                  <TableCell>{member.mobileNumber}</TableCell>
                  <TableCell>{member.email ?? "—"}</TableCell>
                  <TableCell>{branchLabel(member.branch)}</TableCell>
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <MemberActions member={member} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {visibleMembers.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Showing {pageStart + 1}–{pageStart + pageMembers.length} of{" "}
            {visibleMembers.length} members
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Rows</p>
              <ChoiceGroup
                id="member-page-size"
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
            <MembersPagination
              page={currentPage}
              pageCount={pageCount}
              onPageChange={showPage}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MemberActions({ member }: { member: Member }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const name = memberName(member);

  function onOpenChange(open: boolean) {
    if (deleting) {
      return;
    }
    setConfirmOpen(open);
    if (!open) {
      setError(null);
    }
  }

  async function remove() {
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/members/${encodeURIComponent(member.id)}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        setError("Could not delete this member. Please try again.");
        return;
      }
      toast.success("Member deleted.");
      setConfirmOpen(false);
      router.refresh();
    } catch {
      setError("Could not delete this member. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Modal
        open={confirmOpen}
        onOpenChange={onOpenChange}
        icon={<Trash2Icon />}
        title="Delete member"
        description="This action cannot be undone."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        pending={deleting}
        onConfirm={() => void remove()}
      >
        <p>
          You are about to permanently delete{" "}
          <span className="font-semibold text-foreground">“{name}”</span>. They
          will no longer be in the members database.
          {member.isDgroupLeader
            ? " Meetings they lead will be removed as well."
            : null}
        </p>
        {error ? <p className="text-destructive">{error}</p> : null}
      </Modal>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
          <MoreHorizontalIcon />
          <span className="sr-only">Open actions for {name}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => router.push(`/members/${member.id}?edit=1`)}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
            >
              Delete
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/members/${member.id}?tab=glc`)}
            >
              GLC progress
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/members/${member.id}?tab=dgroup`)}
            >
              DGroups
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

function MembersPagination({
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
            className={page === 1 ? "pointer-events-none opacity-50" : undefined}
            onClick={(event) => {
              event.preventDefault();
              onPageChange(page - 1);
            }}
          />
        </PaginationItem>
        {pageList(page, pageCount).map((item, index) => (
          <PaginationItem key={item === "ellipsis" ? `ellipsis-${index}` : item}>
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

function FilterGroup<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="text-sm font-medium">{label}</p>
      <ChoiceGroup
        id={id}
        label={label}
        value={value}
        options={options}
        onChange={onChange}
      />
    </div>
  );
}

function churchBranches(members: Member[]): Member["branch"][] {
  const byId = new Map<string, Member["branch"]>();
  for (const member of members) {
    if (!byId.has(member.branch.id)) {
      byId.set(member.branch.id, member.branch);
    }
  }
  return [...byId.values()].sort((a, b) => a.branch.localeCompare(b.branch));
}

type MemberFilters = {
  branchId: string;
  gender: (typeof GENDERS)[number]["value"];
  dgroupLeader: (typeof DGROUP_LEADERS)[number]["value"];
  civilStatus: (typeof CIVIL_STATUSES)[number]["value"];
};

function filterMembers(
  members: Member[],
  query: string,
  filters: MemberFilters,
): Member[] {
  const normalized = query.trim().toLowerCase();
  return members.filter((member) => {
    if (filters.branchId !== ALL && member.branch.id !== filters.branchId) {
      return false;
    }
    if (filters.gender !== ALL && member.gender !== filters.gender) {
      return false;
    }
    if (filters.dgroupLeader === "yes" && !member.isDgroupLeader) {
      return false;
    }
    if (filters.dgroupLeader === "no" && member.isDgroupLeader) {
      return false;
    }
    if (
      filters.civilStatus !== ALL &&
      member.civilStatus !== filters.civilStatus
    ) {
      return false;
    }
    if (!normalized) {
      return true;
    }
    const branch = branchLabel(member.branch).toLowerCase();
    return (
      memberName(member).toLowerCase().includes(normalized) ||
      (member.membershipId ?? "").toLowerCase().includes(normalized) ||
      member.mobileNumber.toLowerCase().includes(normalized) ||
      (member.email ?? "").toLowerCase().includes(normalized) ||
      branch.includes(normalized)
    );
  });
}

function emptyMembersMessage(
  memberCount: number,
  query: string,
  filtersActive: boolean,
): string {
  if (memberCount === 0) {
    return "No approved members yet.";
  }
  if (query.trim() && !filtersActive) {
    return "No members match this search.";
  }
  return "No members match these filters.";
}
