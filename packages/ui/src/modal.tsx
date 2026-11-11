"use client";

import * as React from "react";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";

export function Modal({
  open,
  onOpenChange,
  icon,
  title,
  description,
  children,
  cancelLabel = "Cancel",
  confirmLabel,
  confirmVariant = "destructive",
  onConfirm,
  secondaryAction,
  pending = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  cancelLabel?: string;
  confirmLabel: string;
  confirmVariant?: "default" | "destructive";
  onConfirm: () => void;
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  pending?: boolean;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending) {
          return;
        }
        onOpenChange(next);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden bg-background p-0 sm:max-w-md"
      >
        <DialogHeader className="flex-row items-center gap-4 bg-primary px-6 py-5 text-primary-foreground">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 [&_svg]:size-5">
            {icon}
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            <DialogDescription className="text-primary-foreground/80">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="flex flex-col gap-3 px-6 py-6 text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
        <DialogFooter className="m-0 border-t-0 bg-background px-6 pt-0 pb-6">
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          {secondaryAction ? (
            <Button
              variant="destructive"
              disabled={pending || secondaryAction.disabled}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          ) : null}
          <Button
            variant={confirmVariant}
            disabled={pending}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
