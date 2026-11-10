"use server";

import { apiBaseUrl } from "./api";

export type RegisterMemberInput = {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  messengerName: string;
  birthdate: string;
  gender: string;
  civilStatus: string;
  branchId: string;
  isDgroupLeader: boolean;
  dgroupMeetings?: {
    name: string;
    description: string;
    days: string[];
    time: string;
  }[];
};

export type RegisterMemberResult = { error: string | null };

const FAILED = "Could not submit your registration. Try again.";

export async function registerMember(
  input: RegisterMemberInput,
): Promise<RegisterMemberResult> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl()}/members`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
    });
  } catch {
    return { error: FAILED };
  }

  if (response.ok) {
    return { error: null };
  }

  try {
    const body = (await response.json()) as { message?: unknown };
    if (typeof body.message === "string") {
      return { error: body.message };
    }
    if (Array.isArray(body.message)) {
      return { error: body.message.join(", ") };
    }
  } catch {
    // status only
  }
  return { error: FAILED };
}
