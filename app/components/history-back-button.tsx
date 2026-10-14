"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export default function HistoryBackButton({ fallback, children, className, ariaLabel = "Back" }: { fallback: string; children: ReactNode; className?: string; ariaLabel?: string }) {
  const router = useRouter();
  return <button suppressHydrationWarning type="button" className={className} aria-label={ariaLabel} onClick={() => {
    if (window.history.length > 1) router.back();
    else router.replace(fallback);
  }}>{children}</button>;
}
