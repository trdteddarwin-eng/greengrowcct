// Client-side event tracking — fire-and-forget to /api/track

const SESSION_ID =
  typeof window !== "undefined" ? crypto.randomUUID() : "server";

interface TrackEventParams {
  eventType: string;
  metadata?: Record<string, unknown>;
  pagePath?: string;
}

export function trackEvent({ eventType, metadata, pagePath }: TrackEventParams) {
  if (typeof window === "undefined") return;

  const body = JSON.stringify({
    eventType,
    metadata: metadata ?? {},
    pagePath: pagePath ?? window.location.pathname,
    sessionId: SESSION_ID,
  });

  // Use sendBeacon for reliability (works on page unload), fall back to fetch
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/track", body);
  } else {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // Silently fail — tracking should never block the user
    });
  }
}
