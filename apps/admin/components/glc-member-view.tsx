"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import type { GlcProgress } from "@/lib/glc-progress";

export function GlcMemberView({
  memberId,
  progress,
}: {
  memberId: string;
  progress: GlcProgress | null;
}) {
  const router = useRouter();
  const [starting, setStarting] = React.useState(false);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [overrides, setOverrides] = React.useState<Record<string, boolean>>({});
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setOverrides({});
  }, [progress]);

  async function start() {
    setStarting(true);
    setError(null);
    try {
      const response = await fetch(progressPath(memberId), { method: "POST" });
      if (!response.ok) {
        throw new Error(await readError(response, "Could not start GLC."));
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start GLC.");
    } finally {
      setStarting(false);
    }
  }

  async function setAttended(sessionId: string, attended: boolean) {
    setSavingId(sessionId);
    setError(null);
    setOverrides((current) => ({ ...current, [sessionId]: attended }));
    try {
      const response = await fetch(sessionPath(memberId, sessionId), {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ attended }),
      });
      if (!response.ok) {
        throw new Error(
          await readError(response, "Could not update attendance."),
        );
      }
      router.refresh();
    } catch (err) {
      setOverrides((current) => {
        const next = { ...current };
        delete next[sessionId];
        return next;
      });
      setError(
        err instanceof Error ? err.message : "Could not update attendance.",
      );
    } finally {
      setSavingId(null);
    }
  }

  if (!progress) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-md border border-dashed px-4 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          This member has not started GLC.
        </p>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="button" disabled={starting} onClick={() => void start()}>
          Start GLC
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold tracking-tight">Attendance</h2>
        <p className="text-sm text-muted-foreground">
          {progress.attendedCount} of {progress.sessionCount} sessions attended
        </p>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      {progress.levels.map((level) => (
        <section key={level.id} className="flex flex-col gap-4 mb-8">
          <h3 className="text-2xl font-bold tracking-tight text-primary">
            {level.name} · {level.title}
          </h3>
          {level.books.map((book) => (
            <div key={book.id} className="flex flex-col gap-2">
              <h4 className="text-base font-bold">
                Book {book.number} · {book.title}
              </h4>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary">
                      {book.sessions.map((session) => (
                        <TableHead
                          key={session.id}
                          className="text-white min-w-36 whitespace-normal text-center font-bold"
                        >
                          Session {session.number}
                        </TableHead>
                      ))}
                    </TableRow>
                    <TableRow className="bg-primary/30">
                      {book.sessions.map((session) => (
                        <TableHead
                          key={session.id}
                          className="min-w-36 whitespace-normal text-center font-semibold text-xs"
                        >
                          {session.title}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      {book.sessions.map((session) => {
                        const attended =
                          overrides[session.id] ?? session.attended;
                        const saving = savingId === session.id;
                        return (
                          <TableCell key={session.id} className="text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={attended}
                                disabled={saving}
                                aria-label={`${session.title} attended`}
                                onCheckedChange={(value) =>
                                  void setAttended(session.id, value === true)
                                }
                              />
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

function progressPath(memberId: string): string {
  return `/api/glc/members/${encodeURIComponent(memberId)}/progress`;
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
