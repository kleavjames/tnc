"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { cn } from "cn";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/components/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import {
  branchLabel,
  formatMemberDate,
  memberName,
} from "../lib/member-display";
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

const selectedFilterClass =
  "min-w-fit aria-pressed:bg-primary! aria-pressed:text-primary-foreground data-[state=on]:border-primary data-[state=on]:bg-primary! data-[state=on]:text-primary-foreground! data-[state=on]:hover:bg-primary data-[state=on]:hover:text-primary-foreground";

export function MembersView({ members }: { members: Member[] }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [branchId, setBranchId] = React.useState(ALL);
  const [gender, setGender] =
    React.useState<(typeof GENDERS)[number]["value"]>(ALL);
  const [dgroupLeader, setDgroupLeader] =
    React.useState<(typeof DGROUP_LEADERS)[number]["value"]>(ALL);
  const [civilStatus, setCivilStatus] =
    React.useState<(typeof CIVIL_STATUSES)[number]["value"]>(ALL);
  const branches = churchBranches(members);
  const filters = { branchId, gender, dgroupLeader, civilStatus };
  const visibleMembers = filterMembers(members, query, filters);
  const filtersActive = Object.values(filters).some((value) => value !== ALL);

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
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search name, mobile, or ID..."
                />
                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div className="flex flex-row gap-10">
              {branches.length > 0 ? (
                <FilterChoices
                  fit
                  label="Branch"
                  value={branchId}
                  options={[
                    { value: ALL, label: "All" },
                    ...branches.map((branch) => ({
                      value: branch.id,
                      label: branch.branch,
                    })),
                  ]}
                  onValueChange={setBranchId}
                />
              ) : null}
              <FilterChoices
                fit
                label="Gender"
                value={gender}
                options={GENDERS}
                onValueChange={(value) => {
                  if (isChoice(value, GENDERS)) setGender(value);
                }}
              />
              <FilterChoices
                fit
                label="Dgroup leader"
                value={dgroupLeader}
                options={DGROUP_LEADERS}
                onValueChange={(value) => {
                  if (isChoice(value, DGROUP_LEADERS)) setDgroupLeader(value);
                }}
              />
              <FilterChoices
                fit
                className="w-fit justify-self-start sm:col-span-3"
                label="Civil status"
                value={civilStatus}
                options={CIVIL_STATUSES}
                onValueChange={(value) => {
                  if (isChoice(value, CIVIL_STATUSES)) setCivilStatus(value);
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
                  Registered
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleMembers.map((member) => (
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
                  <TableCell>{formatMemberDate(member.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Showing {visibleMembers.length} of {members.length} members
      </p>
    </div>
  );
}

function FilterChoices({
  className,
  fit = false,
  label,
  value,
  options,
  onValueChange,
}: {
  className?: string;
  fit?: boolean;
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onValueChange: (value: string) => void;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <p className="text-sm font-medium">{label}</p>
      <div className="max-w-full overflow-x-auto">
        <ToggleGroup
          className={fit ? "w-fit" : "w-full"}
          variant="outline"
          spacing={0}
          aria-label={label}
          value={[value]}
          onValueChange={(next) => {
            const choice = next[0];
            if (choice) onValueChange(choice);
          }}
        >
          {options.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              className={cn(selectedFilterClass, !fit && "flex-1")}
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}

function isChoice<T extends string>(
  value: string,
  options: readonly { value: T }[],
): value is T {
  return options.some((option) => option.value === value);
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
