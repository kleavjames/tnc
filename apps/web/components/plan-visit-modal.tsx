"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import Image from "next/image";
import {
  CrosshairIcon,
  ExternalLinkIcon,
  MapPinIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalTitle,
} from "@repo/ui/components/modal";
import { cn } from "@repo/ui/lib/utils";

const LOGO_SRC = "/tnc-logo-v2-transparent.png";
const CHURCH_ADDRESS =
  "door 6&7, Camfer Building, 154 Bonifacio St, Poblacion District, Davao City, 8000 Davao del Sur";
const CHURCH_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CHURCH_ADDRESS)}`;
const CHURCH_MAPS_EMBED = `https://maps.google.com/maps?q=${encodeURIComponent(CHURCH_ADDRESS)}&z=15&output=embed`;

type PlanVisitModalContextValue = {
  openPlanVisitModal: () => void;
};

const PlanVisitModalContext = createContext<PlanVisitModalContextValue | null>(
  null,
);

function usePlanVisitModal() {
  const context = useContext(PlanVisitModalContext);
  if (!context) {
    throw new Error(
      "usePlanVisitModal must be used within PlanVisitModalProvider",
    );
  }
  return context;
}

export function PlanVisitModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openPlanVisitModal = useCallback(() => {
    setOpen(true);
  }, []);

  const openDirectionsFromCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      window.open(CHURCH_MAPS_URL, "_blank", "noopener,noreferrer");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${encodeURIComponent(CHURCH_ADDRESS)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      },
      () => {
        window.open(CHURCH_MAPS_URL, "_blank", "noopener,noreferrer");
      },
    );
  }, []);

  return (
    <PlanVisitModalContext.Provider value={{ openPlanVisitModal }}>
      {children}
      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent
          showCloseButton={false}
          className="sm:max-w-3xl"
          panelClassName="gap-0 p-0"
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div className="flex min-w-0 items-start gap-3">
              <Image
                src={LOGO_SRC}
                alt=""
                width={36}
                height={36}
                className="size-10 shrink-0 object-contain"
              />
              <div className="flex min-w-0 flex-col gap-1">
                <ModalTitle className="text-sm font-bold tracking-normal uppercase">
                  Plan your visit
                </ModalTitle>
                <ModalDescription className="text-sm text-muted-foreground">
                  Find us on Sunday — free meal after the service
                </ModalDescription>
              </div>
            </div>
            <ModalClose
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 rounded-full"
                />
              }
            >
              <XIcon />
              <span className="sr-only">Close</span>
            </ModalClose>
          </div>

          <div className="relative aspect-[16/10] w-full bg-muted sm:aspect-[16/9]">
            <iframe
              title="True North Church location"
              src={CHURCH_MAPS_EMBED}
              className="size-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              className="absolute top-3 left-3 bg-card"
              render={
                <a
                  href={CHURCH_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <ExternalLinkIcon data-icon="inline-start" />
              Open in Maps
            </Button>
          </div>

          <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground max-w-md">
              <MapPinIcon className="size-4 shrink-0 text-primary" />
              {CHURCH_ADDRESS}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {/* <Button
                variant="outline"
                size="lg"
                nativeButton={false}
                render={
                  <a
                    href={CHURCH_MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <Image
                  src={LOGO_SRC}
                  alt=""
                  width={18}
                  height={18}
                  className="size-[18px] object-contain"
                />
                Church location
              </Button> */}
              <Button size="lg" onClick={openDirectionsFromCurrentLocation}>
                <CrosshairIcon data-icon="inline-start" />
                Check directions
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </PlanVisitModalContext.Provider>
  );
}

export function PlanVisitButton({
  className,
  size = "lg",
  ...props
}: ComponentProps<typeof Button>) {
  const { openPlanVisitModal } = usePlanVisitModal();

  return (
    <Button
      size={size}
      className={cn(className)}
      onClick={openPlanVisitModal}
      {...props}
    />
  );
}
