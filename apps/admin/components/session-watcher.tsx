"use client";

import { useEffect } from "react";

export function SessionWatcher({ expiresAt }: { expiresAt: string }) {
  useEffect(() => {
    const expires = new Date(expiresAt).getTime();
    const delay = Number.isFinite(expires) ? expires - Date.now() : 0;
    const timer = window.setTimeout(() => {
      window.location.assign("/api/auth/logout");
    }, Math.max(delay, 0));
    return () => window.clearTimeout(timer);
  }, [expiresAt]);

  return null;
}
