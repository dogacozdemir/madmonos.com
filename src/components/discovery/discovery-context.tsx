"use client";

import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useRef, useState } from "react";

const DiscoveryModal = dynamic(
  () => import("@/components/discovery/discovery-modal").then((m) => m.DiscoveryModal),
  { ssr: false }
);

type DiscoveryCtx = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const DiscoveryContextObj = createContext<DiscoveryCtx | null>(null);

export function useDiscovery() {
  const v = useContext(DiscoveryContextObj);
  if (!v) {
    throw new Error("useDiscovery must be used within DiscoveryProvider");
  }
  return v;
}

export function DiscoveryProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const openerKindRef = useRef<"fab" | "other">("other");

  const open = useCallback(() => {
    const ae = document.activeElement;
    if (ae instanceof HTMLElement) {
      previouslyFocusedRef.current = ae;
      openerKindRef.current = ae.id === "discovery-fab" ? "fab" : "other";
    } else {
      previouslyFocusedRef.current = null;
      openerKindRef.current = "other";
    }
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    const el = previouslyFocusedRef.current;
    const kind = openerKindRef.current;
    previouslyFocusedRef.current = null;
    openerKindRef.current = "other";
    const restore = () => {
      if (el && document.contains(el)) {
        el.focus();
        return;
      }
      if (kind === "fab") {
        document.getElementById("discovery-fab")?.focus();
      } else {
        document.getElementById("discovery-primary-trigger")?.focus();
      }
    };
    requestAnimationFrame(() => requestAnimationFrame(restore));
  }, []);

  return (
    <DiscoveryContextObj.Provider value={{ open, close, isOpen }}>
      {children}
      {isOpen ? <DiscoveryModal isOpen onClose={close} /> : null}
    </DiscoveryContextObj.Provider>
  );
}
