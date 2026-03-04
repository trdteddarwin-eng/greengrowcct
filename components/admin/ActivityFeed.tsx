"use client";

import { motion } from "framer-motion";

interface ActivityEvent {
  id: string;
  userId: string;
  displayName: string;
  eventType: string;
  metadata: Record<string, unknown>;
  pagePath: string | null;
  createdAt: string;
}

interface ActivityFeedProps {
  events: ActivityEvent[];
  maxHeight?: string;
}

const eventLabels: Record<string, { label: string; color: string }> = {
  page_view: { label: "Viewed page", color: "bg-blue-500" },
  login: { label: "Logged in", color: "bg-green-500" },
  logout: { label: "Logged out", color: "bg-gray-500" },
  call_started: { label: "Started a call", color: "bg-amber-500" },
  call_ended: { label: "Ended a call", color: "bg-amber-600" },
  call_scored: { label: "Scored a call", color: "bg-purple-500" },
  heartbeat: { label: "Active", color: "bg-gray-600" },
  playbook_saved: { label: "Saved playbook", color: "bg-teal-500" },
  scenario_created: { label: "Created scenario", color: "bg-pink-500" },
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function eventDescription(event: ActivityEvent): string {
  const base = eventLabels[event.eventType]?.label ?? event.eventType;
  const meta = event.metadata;

  if (event.eventType === "page_view" && event.pagePath) {
    return `${base} ${event.pagePath}`;
  }
  if (event.eventType === "call_started" && meta?.scenarioName) {
    return `${base}: ${meta.scenarioName}`;
  }
  if (event.eventType === "call_scored" && meta?.score !== undefined) {
    return `${base} — ${meta.score}/10`;
  }
  return base;
}

export default function ActivityFeed({
  events,
  maxHeight = "max-h-[500px]",
}: ActivityFeedProps) {
  if (events.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8 text-sm">
        No activity yet
      </div>
    );
  }

  return (
    <div className={`${maxHeight} overflow-y-auto space-y-1 pr-1`}>
      {events.map((event, i) => {
        const info = eventLabels[event.eventType] ?? {
          label: event.eventType,
          color: "bg-gray-500",
        };

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-gray-800/30 transition-colors"
          >
            <div
              className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${info.color}`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-200 truncate">
                <span className="font-medium text-white">
                  {event.displayName}
                </span>{" "}
                {eventDescription(event)}
              </p>
            </div>
            <span className="text-xs text-gray-600 shrink-0 whitespace-nowrap">
              {relativeTime(event.createdAt)}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
