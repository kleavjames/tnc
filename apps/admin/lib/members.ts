import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, apiBaseUrl } from "./session-cookie";

export type MemberStatus = "pending" | "approved" | "reject";

export type Member = {
  id: string;
  membershipId: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string | null;
  messengerName: string | null;
  birthdate: string;
  gender: "male" | "female";
  civilStatus: "single" | "married" | "widowed" | "separated";
  isDgroupLeader: boolean;
  preTrueLife: boolean;
  trueLife: boolean;
  baptism: boolean;
  status: MemberStatus;
  createdAt: string;
  branch: { id: string; name: string; branch: string };
  roles: string[];
  dgroupMeeting: {
    id: string;
    name: string;
    days: string[];
    time: string;
  } | null;
  dgroupMeetings: {
    id: string;
    name: string;
    description: string;
    days: string[];
    time: string;
  }[];
};

const STATUSES = new Set<MemberStatus>(["pending", "approved", "reject"]);
const GENDERS = new Set<Member["gender"]>(["male", "female"]);
const CIVIL_STATUSES = new Set<Member["civilStatus"]>([
  "single",
  "married",
  "widowed",
  "separated",
]);

export async function listMembers(
  status: "pending" | "approved",
): Promise<Member[]> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    redirect("/");
  }

  const response = await fetch(
    `${apiBaseUrl()}/members?status=${encodeURIComponent(status)}`,
    {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  if (response.status === 401) {
    redirect("/api/auth/logout");
  }
  if (!response.ok) {
    throw new Error("Could not load members.");
  }

  const body: unknown = await response.json();
  if (!Array.isArray(body)) {
    throw new Error("Could not load members.");
  }

  return body.flatMap((item) => {
    const member = parseMember(item);
    return member ? [member] : [];
  });
}

export async function getMember(id: string): Promise<Member | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    redirect("/");
  }

  const response = await fetch(
    `${apiBaseUrl()}/members/${encodeURIComponent(id)}`,
    {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  if (response.status === 401) {
    redirect("/api/auth/logout");
  }
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error("Could not load the member.");
  }

  const member = parseMember(await response.json());
  if (!member) {
    throw new Error("Could not load the member.");
  }
  return member;
}

function parseMember(value: unknown): Member | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.id !== "string" ||
    typeof record.membershipId !== "string" ||
    typeof record.firstName !== "string" ||
    typeof record.lastName !== "string" ||
    typeof record.mobileNumber !== "string" ||
    typeof record.birthdate !== "string" ||
    typeof record.createdAt !== "string" ||
    typeof record.isDgroupLeader !== "boolean" ||
    typeof record.preTrueLife !== "boolean" ||
    typeof record.trueLife !== "boolean" ||
    typeof record.baptism !== "boolean" ||
    !isStatus(record.status) ||
    !isGender(record.gender) ||
    !isCivilStatus(record.civilStatus) ||
    !isBranch(record.branch)
  ) {
    return null;
  }

  const dgroupMeeting = attendedMeeting(record.dgroupMeeting);
  if (dgroupMeeting === undefined) {
    return null;
  }

  return {
    id: record.id,
    membershipId: record.membershipId,
    firstName: record.firstName,
    lastName: record.lastName,
    mobileNumber: record.mobileNumber,
    email: optionalText(record.email),
    messengerName: optionalText(record.messengerName),
    birthdate: record.birthdate,
    gender: record.gender,
    civilStatus: record.civilStatus,
    isDgroupLeader: record.isDgroupLeader,
    preTrueLife: record.preTrueLife,
    trueLife: record.trueLife,
    baptism: record.baptism,
    status: record.status,
    createdAt: record.createdAt,
    branch: record.branch,
    roles: roleNames(record.roles),
    dgroupMeeting,
    dgroupMeetings: meetings(record.dgroupMeetings),
  };
}

function roleNames(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    const name = (item as { name?: unknown } | null)?.name;
    return typeof name === "string" ? [name] : [];
  });
}

function isStatus(value: unknown): value is MemberStatus {
  return typeof value === "string" && STATUSES.has(value as MemberStatus);
}

function isGender(value: unknown): value is Member["gender"] {
  return typeof value === "string" && GENDERS.has(value as Member["gender"]);
}

function isCivilStatus(value: unknown): value is Member["civilStatus"] {
  return (
    typeof value === "string" &&
    CIVIL_STATUSES.has(value as Member["civilStatus"])
  );
}

function isBranch(value: unknown): value is Member["branch"] {
  if (!value || typeof value !== "object") {
    return false;
  }
  const branch = value as Record<string, unknown>;
  return (
    typeof branch.id === "string" &&
    typeof branch.name === "string" &&
    typeof branch.branch === "string"
  );
}

function optionalText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function attendedMeeting(value: unknown): Member["dgroupMeeting"] | undefined {
  if (value === null) {
    return null;
  }
  if (!value || typeof value !== "object") {
    return undefined;
  }
  const meeting = value as Record<string, unknown>;
  if (
    typeof meeting.id !== "string" ||
    typeof meeting.name !== "string" ||
    typeof meeting.time !== "string"
  ) {
    return undefined;
  }
  return {
    id: meeting.id,
    name: meeting.name,
    days: Array.isArray(meeting.days)
      ? meeting.days.filter((day): day is string => typeof day === "string")
      : [],
    time: meeting.time,
  };
}

function meetings(value: unknown): Member["dgroupMeetings"] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }
    const meeting = item as Record<string, unknown>;
    if (
      typeof meeting.id !== "string" ||
      typeof meeting.name !== "string" ||
      typeof meeting.time !== "string"
    ) {
      return [];
    }
    return [
      {
        id: meeting.id,
        name: meeting.name,
        description:
          typeof meeting.description === "string" ? meeting.description : "",
        days: Array.isArray(meeting.days)
          ? meeting.days.filter((day): day is string => typeof day === "string")
          : [],
        time: meeting.time,
      },
    ];
  });
}
