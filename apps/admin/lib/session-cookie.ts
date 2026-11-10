export const SESSION_COOKIE = "tnc_session";
export const SESSION_MAX_AGE = 60 * 60 * 24;

export function apiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}
