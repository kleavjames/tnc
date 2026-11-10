"use client";

import { useState } from "react";
import { XIcon } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

export function ChipInput({
  id,
  values,
  placeholder,
  onAdd,
  onRemove,
  className,
}: {
  id: string;
  values: string[];
  placeholder?: string;
  onAdd: (value: string) => void | Promise<void>;
  onRemove: (value: string) => void | Promise<void>;
  className?: string;
}) {
  const [draft, setDraft] = useState("");

  async function commit() {
    const next = draft.trim();
    if (!next) {
      return;
    }
    if (values.includes(next)) {
      setDraft("");
      return;
    }
    try {
      await onAdd(next);
      setDraft("");
    } catch {
      // Keep the typed text so the parent can show why it failed.
    }
  }

  return (
    <div
      className={cn(
        "flex min-h-10 flex-wrap content-start items-start gap-1.5 rounded-md border border-input bg-white px-2 py-1.5 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        className,
      )}
    >
      {values.map((value) => (
        <span
          key={value}
          className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2 py-0.5 text-xs font-medium"
        >
          {value}
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            aria-label={`Remove ${value}`}
            onClick={() => void onRemove(value)}
          >
            <XIcon className="size-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void commit();
          }
        }}
        onBlur={() => void commit()}
        placeholder={placeholder}
        className="h-6 min-w-16 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
