"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  branchLabel,
  formatMemberDate,
  labelize,
} from "@/lib/member-display";
import type { ChurchBranch } from "@/lib/church-branches";
import type { Member } from "@/lib/members";

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
] as const;

const CIVIL_STATUSES = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "widowed", label: "Widowed" },
  { value: "separated", label: "Separated" },
] as const;

type Draft = {
  firstName: string;
  lastName: string;
  birthdate: string;
  gender: Member["gender"];
  civilStatus: Member["civilStatus"];
  mobileNumber: string;
  email: string;
  messengerName: string;
  branchId: string;
  isDgroupLeader: boolean;
  preTrueLife: boolean;
  trueLife: boolean;
  baptism: boolean;
};

export function MemberPersonalTab({
  member: initialMember,
  branches,
}: {
  member: Member;
  branches: ChurchBranch[];
}) {
  const router = useRouter();
  const [member, setMember] = React.useState(initialMember);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState<Draft>(() => draftFromMember(member));
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMember(initialMember);
    setDraft(draftFromMember(initialMember));
  }, [initialMember]);

  function startEdit() {
    setDraft(draftFromMember(member));
    setError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setDraft(draftFromMember(member));
    setError(null);
    setEditing(false);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const body = {
        firstName: draft.firstName,
        lastName: draft.lastName,
        birthdate: draft.birthdate,
        gender: draft.gender,
        civilStatus: draft.civilStatus,
        mobileNumber: draft.mobileNumber,
        email: draft.email.trim() ? draft.email.trim() : "",
        messengerName: draft.messengerName.trim()
          ? draft.messengerName.trim()
          : "",
        branchId: draft.branchId,
        isDgroupLeader: draft.isDgroupLeader,
        preTrueLife: draft.preTrueLife,
        trueLife: draft.trueLife,
        baptism: draft.baptism,
      };
      const response = await fetch(`/api/members/${member.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(await readError(response));
      }
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save member information.",
      );
    } finally {
      setSaving(false);
    }
  }

  const branchItems = branches.map((branch) => ({
    value: branch.id,
    label: branchLabel(branch),
  }));

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Profile and church details for this member.
        </p>
        {editing ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={cancelEdit}
            >
              Cancel
            </Button>
            <Button type="button" disabled={saving} onClick={() => void save()}>
              Save
            </Button>
          </div>
        ) : (
          <Button type="button" variant="outline" onClick={startEdit}>
            Edit information
          </Button>
        )}
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {editing ? (
        <FieldGroup>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
            <EditSection title="Personal">
              <EditRow label="First name">
                <Input
                  value={draft.firstName}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      firstName: event.target.value,
                    }))
                  }
                />
              </EditRow>
              <EditRow label="Last name">
                <Input
                  value={draft.lastName}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      lastName: event.target.value,
                    }))
                  }
                />
              </EditRow>
              <EditRow label="Birthdate">
                <Input
                  type="date"
                  value={draft.birthdate}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      birthdate: event.target.value,
                    }))
                  }
                />
              </EditRow>
              <EditRow label="Gender">
                <Select
                  items={GENDERS}
                  value={draft.gender}
                  onValueChange={(value) => {
                    if (value === "male" || value === "female") {
                      setDraft((current) => ({ ...current, gender: value }));
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {GENDERS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </EditRow>
              <EditRow label="Civil status">
                <Select
                  items={CIVIL_STATUSES}
                  value={draft.civilStatus}
                  onValueChange={(value) => {
                    if (
                      value === "single" ||
                      value === "married" ||
                      value === "widowed" ||
                      value === "separated"
                    ) {
                      setDraft((current) => ({ ...current, civilStatus: value }));
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {CIVIL_STATUSES.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </EditRow>
            </EditSection>

            <EditSection title="Contact">
              <EditRow label="Mobile">
                <Input
                  value={draft.mobileNumber}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      mobileNumber: event.target.value,
                    }))
                  }
                />
              </EditRow>
              <EditRow label="Email">
                <Input
                  type="email"
                  value={draft.email}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
              </EditRow>
              <EditRow label="Messenger">
                <Input
                  value={draft.messengerName}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      messengerName: event.target.value,
                    }))
                  }
                />
              </EditRow>
            </EditSection>
          </div>

          <EditSection title="Church">
            <EditRow label="Branch">
              <Select
                items={branchItems}
                value={draft.branchId}
                onValueChange={(value) => {
                  if (typeof value === "string") {
                    setDraft((current) => ({ ...current, branchId: value }));
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {branchItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </EditRow>
            <EditRow label="Dgroup leader">
              <BooleanField
                checked={draft.isDgroupLeader}
                onCheckedChange={(checked) =>
                  setDraft((current) => ({
                    ...current,
                    isDgroupLeader: checked,
                  }))
                }
              />
            </EditRow>
            <EditRow label="Pre-True Life">
              <BooleanField
                checked={draft.preTrueLife}
                onCheckedChange={(checked) =>
                  setDraft((current) => ({ ...current, preTrueLife: checked }))
                }
              />
            </EditRow>
            <EditRow label="True Life">
              <BooleanField
                checked={draft.trueLife}
                onCheckedChange={(checked) =>
                  setDraft((current) => ({ ...current, trueLife: checked }))
                }
              />
            </EditRow>
            <EditRow label="Baptism">
              <BooleanField
                checked={draft.baptism}
                onCheckedChange={(checked) =>
                  setDraft((current) => ({ ...current, baptism: checked }))
                }
              />
            </EditRow>
            <ReadOnlyRow label="Roles" value={member.roles.join(", ")} />
            <ReadOnlyRow
              label="Registered"
              value={formatMemberDate(member.createdAt)}
            />
          </EditSection>
        </FieldGroup>
      ) : (
        <>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
            <ViewSection title="Personal">
              <ViewField label="First name" value={member.firstName} />
              <ViewField label="Last name" value={member.lastName} />
              <ViewField
                label="Birthdate"
                value={formatMemberDate(member.birthdate)}
              />
              <ViewField label="Gender" value={labelize(member.gender)} />
              <ViewField
                label="Civil status"
                value={labelize(member.civilStatus)}
              />
            </ViewSection>

            <ViewSection title="Contact">
              <ViewField label="Mobile" value={member.mobileNumber} />
              <ViewField label="Email" value={member.email} />
              <ViewField label="Messenger" value={member.messengerName} />
            </ViewSection>
          </div>

          <ViewSection title="Church">
            <ViewField label="Branch" value={branchLabel(member.branch)} />
            <ViewField
              label="Dgroup leader"
              value={member.isDgroupLeader ? "Yes" : "No"}
            />
            <ViewField
              label="Pre-True Life"
              value={member.preTrueLife ? "Yes" : "No"}
            />
            <ViewField label="True Life" value={member.trueLife ? "Yes" : "No"} />
            <ViewField label="Baptism" value={member.baptism ? "Yes" : "No"} />
            <ViewField label="Roles" value={member.roles.join(", ")} />
            <ViewField
              label="Registered"
              value={formatMemberDate(member.createdAt)}
            />
          </ViewSection>
        </>
      )}
    </div>
  );
}

function draftFromMember(member: Member): Draft {
  return {
    firstName: member.firstName,
    lastName: member.lastName,
    birthdate: member.birthdate,
    gender: member.gender,
    civilStatus: member.civilStatus,
    mobileNumber: member.mobileNumber,
    email: member.email ?? "",
    messengerName: member.messengerName ?? "",
    branchId: member.branch.id,
    isDgroupLeader: member.isDgroupLeader,
    preTrueLife: member.preTrueLife,
    trueLife: member.trueLife,
    baptism: member.baptism,
  };
}

function ViewSection({
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

function EditSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <div className="flex flex-col border-t">{children}</div>
    </section>
  );
}

function ViewField({ label, value }: { label: string; value: string | null }) {
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

function EditRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Field
      orientation="responsive"
      className="border-b py-3 sm:items-center sm:[&_[data-slot=field-label]]:w-36"
    >
      <FieldLabel>{label}</FieldLabel>
      <FieldContent className="min-w-0">{children}</FieldContent>
    </Field>
  );
}

function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b py-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 font-semibold break-words">{value || "—"}</span>
    </div>
  );
}

function BooleanField({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <Field orientation="horizontal" className="items-center gap-2">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      <span className="text-sm text-muted-foreground">
        {checked ? "Yes" : "No"}
      </span>
    </Field>
  );
}

async function readError(response: Response): Promise<string> {
  let detail = "Could not save member information.";
  try {
    const body = (await response.json()) as { message?: unknown };
    if (typeof body.message === "string") {
      detail = body.message;
    } else if (Array.isArray(body.message)) {
      detail = body.message.join(", ");
    }
  } catch {
    // status line only
  }
  return detail;
}
