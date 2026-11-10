"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Modal } from "@repo/ui/modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
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
} from "../lib/member-display";
import type { Member } from "../lib/members";

type Decision = "approve" | "reject";

export function PendingMembersView({ members }: { members: Member[] }) {
  const router = useRouter();
  const [selected, setSelected] = React.useState<Member | null>(null);
  const [rejecting, setRejecting] = React.useState<Member | null>(null);
  const rejectTarget = React.useRef<Member | null>(null);
  if (rejecting) {
    rejectTarget.current = rejecting;
  }
  const namedReject = rejecting ?? rejectTarget.current;
  const [busy, setBusy] = React.useState<Decision | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  function openMember(member: Member) {
    if (busy) {
      return;
    }
    setError(null);
    setSelected(member);
  }

  function askReject(member: Member) {
    if (busy) {
      return;
    }
    setError(null);
    setSelected(null);
    setRejecting(member);
  }

  async function decide(member: Member, decision: Decision) {
    setBusy(decision);
    setError(null);
    try {
      const response = await fetch(
        `/api/members/${encodeURIComponent(member.id)}/${decision}`,
        { method: "POST" },
      );
      if (!response.ok) {
        setError(
          decision === "approve"
            ? "Could not approve this registration."
            : "Could not reject this registration.",
        );
        return;
      }
      setSelected(null);
      setRejecting(null);
      router.refresh();
    } catch {
      setError(
        decision === "approve"
          ? "Could not approve this registration."
          : "Could not reject this registration.",
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
      <div>
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link href="/members" />}
        >
          Members
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
          Content
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          Pending registrations
        </h1>
        <p className="max-w-lg text-muted-foreground">
          Review people who registered and have not been approved yet.
        </p>
      </div>

      {error && !selected && !rejecting ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      {members.length === 0 ? (
        <p className="rounded-md border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          No pending registrations.
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-muted-foreground">
                  Name
                </TableHead>
                <TableHead className="font-bold text-muted-foreground">
                  Mobile
                </TableHead>
                <TableHead className="font-bold text-muted-foreground">
                  Branch
                </TableHead>
                <TableHead className="font-bold text-muted-foreground">
                  Registered
                </TableHead>
                <TableHead className="text-right font-bold text-muted-foreground">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <button
                      type="button"
                      className="font-medium"
                      onClick={() => openMember(member)}
                    >
                      {memberName(member)}
                    </button>
                  </TableCell>
                  <TableCell>{member.mobileNumber}</TableCell>
                  <TableCell>{branchLabel(member.branch)}</TableCell>
                  <TableCell>{formatMemberDate(member.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        disabled={busy !== null}
                        onClick={() => void decide(member, "approve")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={busy !== null}
                        onClick={() => askReject(member)}
                      >
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open && !busy) {
            setSelected(null);
            setError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selected ? memberName(selected) : "Registration"}
            </DialogTitle>
            <DialogDescription>
              {selected?.membershipId ?? "Registration details"}
            </DialogDescription>
          </DialogHeader>
          {selected ? <MemberDetails member={selected} /> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button
              variant="destructive"
              disabled={busy !== null || selected === null}
              onClick={() => {
                if (selected) {
                  askReject(selected);
                }
              }}
            >
              Reject
            </Button>
            <Button
              disabled={busy !== null || selected === null}
              onClick={() => {
                if (selected) {
                  void decide(selected, "approve");
                }
              }}
            >
              {busy === "approve" ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Modal
        open={rejecting !== null}
        onOpenChange={(open) => {
          if (!open && busy !== "reject") {
            setRejecting(null);
            setError(null);
          }
        }}
        icon={<Trash2Icon />}
        title="Reject registration"
        description="This action cannot be undone."
        confirmLabel={busy === "reject" ? "Rejecting..." : "Reject"}
        pending={busy === "reject"}
        onConfirm={() => {
          if (namedReject) {
            void decide(namedReject, "reject");
          }
        }}
      >
        <p>
          You are about to permanently remove{" "}
          <span className="font-semibold text-foreground">
            “{namedReject ? memberName(namedReject) : "this registration"}”
          </span>
          . They will no longer be in the members database.
        </p>
        {error ? <p className="text-destructive">{error}</p> : null}
      </Modal>
    </div>
  );
}

function MemberDetails({ member }: { member: Member }) {
  const rows = [
    ["Mobile", member.mobileNumber],
    ["Email", member.email ?? "—"],
    ["Messenger", member.messengerName ?? "—"],
    ["Birthdate", formatMemberDate(member.birthdate)],
    ["Gender", labelize(member.gender)],
    ["Civil status", labelize(member.civilStatus)],
    ["Branch", branchLabel(member.branch)],
    ["Dgroup leader", member.isDgroupLeader ? "Yes" : "No"],
    ["Registered", formatMemberDate(member.createdAt)],
  ];

  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2">
        {rows.map(([label, value]) => (
          <React.Fragment key={label}>
            <dt className="text-muted-foreground">{label}</dt>
            <dd>{value}</dd>
          </React.Fragment>
        ))}
      </dl>
      {member.dgroupMeetings.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground">Dgroup meetings</p>
          <ul className="flex flex-col gap-2">
            {member.dgroupMeetings.map((meeting) => (
              <li key={meeting.id}>
                <span className="font-medium">{meeting.name}</span>
                <span className="text-muted-foreground">
                  {" "}
                  · {meeting.days.map(labelize).join(", ")} · {meeting.time}
                </span>
                {meeting.description ? (
                  <span className="block text-muted-foreground">
                    {meeting.description}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
