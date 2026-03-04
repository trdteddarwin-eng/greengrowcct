"use client";

import { motion } from "framer-motion";
import StatsCards from "./StatsCards";
import ActivityFeed from "./ActivityFeed";

interface CallRow {
  id: string;
  scenarioName: string;
  date: string;
  durationSeconds: number;
  score: number;
}

interface EventRow {
  id: string;
  event_type: string;
  metadata: Record<string, unknown>;
  page_path: string | null;
  created_at: string;
}

interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  role: string;
  totalCalls: number;
  avgScore: number;
  bestScore: number;
  lastActive: string | null;
  joined: string;
}

interface UserDetailProps {
  profile: UserProfile;
  calls: CallRow[];
  events: EventRow[];
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function relativeTime(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function UserDetail({
  profile,
  calls,
  events,
}: UserDetailProps) {
  // Map events to ActivityFeed format
  const activityEvents = events.map((e) => ({
    id: e.id,
    userId: profile.id,
    displayName: profile.displayName,
    eventType: e.event_type,
    metadata: e.metadata ?? {},
    pagePath: e.page_path,
    createdAt: e.created_at,
  }));

  // Score trend data for mini chart
  const scoredCalls = calls
    .filter((c) => c.score > 0)
    .reverse(); // oldest first for chart

  return (
    <div className="space-y-8">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-14 h-14 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xl font-bold text-green-400">
          {profile.displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {profile.displayName}
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                profile.role === "admin"
                  ? "bg-green-950 text-green-400 border border-green-800"
                  : "bg-gray-800 text-gray-400 border border-gray-700"
              }`}
            >
              {profile.role}
            </span>
          </h2>
          <p className="text-sm text-gray-500">
            {profile.email} &middot; Joined{" "}
            {new Date(profile.joined).toLocaleDateString()}
          </p>
        </div>
      </motion.div>

      {/* Stat cards */}
      <StatsCards
        cards={[
          {
            label: "Total Calls",
            value: profile.totalCalls,
            color: "green",
          },
          {
            label: "Avg Score",
            value: profile.avgScore > 0 ? profile.avgScore.toFixed(1) : "—",
            color: "blue",
          },
          {
            label: "Best Score",
            value: profile.bestScore > 0 ? profile.bestScore.toFixed(1) : "—",
            color: "purple",
          },
          {
            label: "Last Active",
            value: relativeTime(profile.lastActive),
            color: "amber",
          },
        ]}
      />

      {/* Score trend mini chart */}
      {scoredCalls.length >= 2 && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 shadow-soft">
          <h3 className="text-sm font-medium text-gray-400 mb-3">
            Score Trend
          </h3>
          <svg
            viewBox={`0 0 ${Math.max(scoredCalls.length * 40, 200)} 100`}
            className="w-full h-24"
            preserveAspectRatio="none"
          >
            {/* Grid lines */}
            {[25, 50, 75].map((y) => (
              <line
                key={y}
                x1={0}
                y1={y}
                x2={scoredCalls.length * 40}
                y2={y}
                stroke="#374151"
                strokeWidth={0.5}
              />
            ))}
            {/* Line */}
            <polyline
              fill="none"
              stroke="#22c55e"
              strokeWidth={2}
              points={scoredCalls
                .map(
                  (c, i) =>
                    `${i * 40 + 20},${100 - c.score * 10}`
                )
                .join(" ")}
            />
            {/* Dots */}
            {scoredCalls.map((c, i) => (
              <circle
                key={c.id}
                cx={i * 40 + 20}
                cy={100 - c.score * 10}
                r={3}
                fill="#22c55e"
              />
            ))}
          </svg>
        </div>
      )}

      {/* Two-column layout: calls + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call history */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 shadow-soft">
          <h3 className="text-sm font-medium text-gray-400 mb-3">
            Call History ({calls.length})
          </h3>
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {calls.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-6">
                No calls yet
              </p>
            )}
            {calls.map((call) => (
              <div
                key={call.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-800/30"
              >
                <div>
                  <p className="text-sm text-white">{call.scenarioName}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(call.date).toLocaleDateString()} &middot;{" "}
                    {formatDuration(call.durationSeconds)}
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold tabular-nums ${
                    call.score >= 7
                      ? "text-green-400"
                      : call.score >= 5
                      ? "text-amber-400"
                      : call.score > 0
                      ? "text-red-400"
                      : "text-gray-500"
                  }`}
                >
                  {call.score > 0 ? call.score.toFixed(1) : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity log */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5 shadow-soft">
          <h3 className="text-sm font-medium text-gray-400 mb-3">
            Activity Log ({events.length})
          </h3>
          <ActivityFeed events={activityEvents} maxHeight="max-h-[400px]" />
        </div>
      </div>
    </div>
  );
}
