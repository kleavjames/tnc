"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
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
import {
  branchLabel,
  formatMemberDate,
  memberName,
} from "../lib/member-display";
import type { Member } from "../lib/members";

export function MembersView({ members }: { members: Member[] }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const visibleMembers = filterMembers(members, query);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <InputGroup className="w-full min-w-0 max-w-md flex-1 rounded-md">
          <InputGroupInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, mobile, or ID..."
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
        <Button
          size="lg"
          className="shrink-0"
          nativeButton={false}
          render={<Link href="/members/pending" />}
        >
          Pending registrations
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">
          Church directory
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Members</h1>
      </div>

      {visibleMembers.length === 0 ? (
        <p className="rounded-md border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          {members.length === 0
            ? "No approved members yet."
            : "No members match this search."}
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

function filterMembers(members: Member[], query: string): Member[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return members;
  }
  return members.filter((member) => {
    const branch = branchLabel(member.branch).toLowerCase();
    return (
      memberName(member).toLowerCase().includes(normalized) ||
      member.membershipId.toLowerCase().includes(normalized) ||
      member.mobileNumber.toLowerCase().includes(normalized) ||
      (member.email ?? "").toLowerCase().includes(normalized) ||
      branch.includes(normalized)
    );
  });
}
