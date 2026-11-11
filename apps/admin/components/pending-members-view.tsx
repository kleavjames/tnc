"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2Icon, UserRoundIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Modal } from "@repo/ui/modal";
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
import { toast } from "sonner";

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
      toast.success(
        decision === "approve"
          ? "Registration approved."
          : "Registration rejected.",
      );
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
                <TableRow
                  key={member.id}
                  className="cursor-pointer"
                  onClick={(event) => {
                    if (
                      event.target instanceof Element &&
                      event.target.closest("button")
                    ) {
                      return;
                    }
                    openMember(member);
                  }}
                >
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

      <Modal
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open && !busy) {
            setSelected(null);
            setError(null);
          }
        }}
        icon={<UserRoundIcon />}
        title={selected ? memberName(selected) : "Registration"}
        description={selected?.membershipId ?? "Pending registration"}
        cancelLabel="Close"
        confirmLabel={busy === "approve" ? "Approving..." : "Approve"}
        confirmVariant="default"
        pending={busy === "approve"}
        onConfirm={() => {
          if (selected) {
            void decide(selected, "approve");
          }
        }}
        secondaryAction={{
          label: "Reject",
          disabled: selected === null,
          onClick: () => {
            if (selected) {
              askReject(selected);
            }
          },
        }}
      >
        {selected ? <MemberPreview member={selected} /> : null}
        {error ? <p className="text-destructive">{error}</p> : null}
      </Modal>

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

function MemberPreview({ member }: { member: Member }) {
  return (
    <div className="flex flex-col gap-6 text-foreground">
      <PreviewSection title="Personal">
        <PreviewField label="First name" value={member.firstName} />
        <PreviewField label="Last name" value={member.lastName} />
        <PreviewField
          label="Birthdate"
          value={formatMemberDate(member.birthdate)}
        />
        <PreviewField label="Gender" value={labelize(member.gender)} />
        <PreviewField
          label="Civil status"
          value={labelize(member.civilStatus)}
        />
      </PreviewSection>
      <PreviewSection title="Contact">
        <PreviewField label="Mobile" value={member.mobileNumber} />
        <PreviewField label="Email" value={member.email} />
        <PreviewField label="Messenger" value={member.messengerName} />
      </PreviewSection>
    </div>
  );
}

function PreviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-1">
      <h2 className="font-semibold text-foreground">{title}</h2>
      <dl className="flex flex-col border-t">{children}</dl>
    </section>
  );
}

function PreviewField({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-3 border-b py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 font-medium break-words text-foreground">
        {value || "—"}
      </dd>
    </div>
  );
}
