"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { trackEvent } from "@/lib/tracking";

export function usePageView() {
  const pathname = usePathname();
  const { user } = useAuth();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    trackEvent({
      eventType: "page_view",
      pagePath: pathname,
    });
  }, [pathname, user]);
}
