"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { trackEvent } from "@/lib/tracking";

const HEARTBEAT_INTERVAL_MS = 60_000; // 60 seconds

export function useHeartbeat() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const tick = () => {
      if (document.visibilityState === "visible") {
        trackEvent({ eventType: "heartbeat" });
      }
    };

    const interval = setInterval(tick, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user]);
}
