"use client";

import { motion } from "framer-motion";
import type { UserEvent } from "@/lib/types";

const eventLabels: Record<string, { label: string; color: string }> = {
  page_view: { label: "Viewed page", color: "bg-blue-500" },
  login: { label: "Logged in", color: "bg-green-500" },
  logout: { label: "Logged out", color: "bg-gray-500" },
  call_started: { label: "Started a call", color: "bg-amber-500" },
  call_ended: { label: "Ended a call", color: "bg-amber-600" },
  call_scored: { label: "Scored a call", color: "bg-purple-500" },
  playbook_saved: { label: "Saved playbook", color: "bg-teal-500" },
  scenario_created: { label: "Created scenario", color: "bg-pink-500" },
};

const HIDDEN_TYPES = new Set(["heartbeat"]);

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function eventDescription(event: UserEvent): string {
  const base = eventLabels[event.event_type]?.label ?? event.event_type;
  const meta = event.metadata;

  if (event.event_type === "page_view" && event.page_path) {
    return `${base} ${event.page_path}`;
  }
  if (event.event_type === "call_started" && meta?.scenarioName) {
    return `${base}: ${meta.scenarioName}`;
  }
  if (event.event_type === "call_scored" && meta?.score !== undefined) {
    return `${base} — ${meta.score}/10`;
  }
  return base;
}

interface ActivityTimelineProps {
  events: UserEvent[];
}

export default function ActivityTimeline({ events }: ActivityTimelineProps) {
  const filtered = events.filter((e) => !HIDDEN_TYPES.has(e.event_type));

  if (filtered.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8 text-sm">
        No activity yet
      </div>
    );
  }

  // Group by day
  const grouped: Record<string, UserEvent[]> = {};
  for (const event of filtered) {
    const day = formatDate(event.created_at);
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(event);
  }

  return (
    <div className="space-y-6 max-h-[600px] overflow-y-auto pr-1">
      {Object.entries(grouped).map(([day, dayEvents]) => (
        <div key={day}>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            {day}
          </h4>
          <div className="relative pl-5 border-l border-gray-800 space-y-1">
            {dayEvents.map((event, i) => {
              const info = eventLabels[event.event_type] ?? {
                label: event.event_type,
                color: "bg-gray-500",
              };

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="relative flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-gray-800/30 transition-colors"
                >
                  <div
                    className={`absolute -left-[26.5px] top-3.5 w-2.5 h-2.5 rounded-full border-2 border-gray-950 ${info.color}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">
                      {eventDescription(event)}
                    </p>
                  </div>
                  <span className="text-xs text-gray-600 shrink-0 whitespace-nowrap">
                    {formatTime(event.created_at)}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
