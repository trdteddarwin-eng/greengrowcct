"use client";

import type { ReactNode } from "react";
import { usePageView } from "@/hooks/usePageView";
import { useHeartbeat } from "@/hooks/useHeartbeat";

export default function TrackingProvider({ children }: { children: ReactNode }) {
  usePageView();
  useHeartbeat();
  return <>{children}</>;
}
