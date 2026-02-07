"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CallSession } from "@/lib/types";

interface CallHistoryProps {
  history: CallSession[];
}

function getScoreColor(score: number): string {
  if (score < 4) return "text-red-400";
  if (score <= 6) return "text-yellow-400";
  return "text-green-400";
}

function getScoreBadgeColor(score: number): string {
  if (score < 4) return "bg-red-500/15 text-red-400 border-red-500/30";
  if (score <= 6)
    return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
  return "bg-green-500/15 text-green-400 border-green-500/30";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

function HistoryRow({ session }: { session: CallSession }) {
  const [expanded, setExpanded] = useState(false);
  const score = session.scorecard?.overallScore;

  return (
    <div className="border-b border-gray-800/50 last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-4 hover:bg-gray-800/30 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-4">
          {/* Date */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {session.scenarioName}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatDate(session.startedAt)}
            </p>
          </div>

          {/* Duration */}
          <div className="hidden sm:block text-right">
            <p className="text-xs text-gray-400">
              {formatDuration(session.durationSeconds)}
            </p>
          </div>

          {/* Score */}
          <div className="flex-shrink-0">
            {score !== undefined ? (
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${getScoreBadgeColor(
                  score
                )}`}
              >
                {score.toFixed(1)}
              </span>
            ) : (
              <span className="text-xs text-gray-600">No score</span>
            )}
          </div>

          {/* Expand chevron */}
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Expandable dimension scores */}
      <AnimatePresence>
        {expanded && session.scorecard && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-3">
                {session.scorecard.dimensions.map((dim) => (
                  <div
                    key={dim.dimension}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-xs text-gray-400 flex-shrink-0 w-36">
                      {dim.label}
                    </span>
                    <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          dim.score < 4
                            ? "bg-red-500"
                            : dim.score <= 6
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${(dim.score / 10) * 100}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-bold w-6 text-right ${getScoreColor(
                        dim.score
                      )}`}
                    >
                      {dim.score}
                    </span>
                  </div>
                ))}

                {session.scorecard.summary && (
                  <p className="text-xs text-gray-500 pt-2 border-t border-gray-800">
                    {session.scorecard.summary}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CallHistory({ history }: CallHistoryProps) {
  // Sort by date (newest first)
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

  if (sortedHistory.length === 0) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-12 text-center">
        <div className="text-4xl mb-4 opacity-50">📞</div>
        <h3 className="text-base font-medium text-gray-300 mb-2">
          No calls yet
        </h3>
        <p className="text-sm text-gray-500">
          Start practicing to see your call history here!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/30 overflow-hidden">
      {/* Table header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-800 bg-gray-900/50">
        <div className="flex-1">
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
            Scenario / Date
          </span>
        </div>
        <div className="hidden sm:block text-right">
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
            Duration
          </span>
        </div>
        <div className="flex-shrink-0 w-14 text-center">
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
            Score
          </span>
        </div>
        <div className="w-4" />
      </div>

      {/* Rows */}
      <div>
        {sortedHistory.map((session) => (
          <HistoryRow key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}
