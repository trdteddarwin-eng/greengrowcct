"use client";

import { motion } from "framer-motion";
import { Clock, Trophy, CheckCircle } from "lucide-react";
import type { AdminTaskAssignment, TaskAttempt } from "@/lib/types";

interface TaskDetailProps {
  assignments: AdminTaskAssignment[];
}

function formatDuration(seconds: number | null): string {
  if (seconds == null) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const statusConfig = {
  pending: { label: "Pending", bg: "bg-gray-800", text: "text-gray-400", border: "border-gray-700" },
  in_progress: { label: "In Progress", bg: "bg-amber-950", text: "text-amber-400", border: "border-amber-800" },
  completed: { label: "Completed", bg: "bg-green-950", text: "text-green-400", border: "border-green-800" },
};

function AttemptRow({ attempt }: { attempt: TaskAttempt }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-800/50">
      <div className="flex items-center gap-4 text-sm">
        <span className="inline-flex items-center gap-1.5 text-gray-400">
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          {formatTime(attempt.started_at)}
        </span>
        {attempt.duration_seconds != null && (
          <span className="text-gray-500">{formatDuration(attempt.duration_seconds)}</span>
        )}
      </div>
      <div>
        {attempt.score != null ? (
          <span
            className={`text-sm font-semibold tabular-nums ${
              Number(attempt.score) >= 7
                ? "text-green-400"
                : Number(attempt.score) >= 5
                ? "text-amber-400"
                : "text-red-400"
            }`}
          >
            {Number(attempt.score).toFixed(1)}
          </span>
        ) : (
          <span className="text-sm text-gray-500">No score</span>
        )}
      </div>
    </div>
  );
}

export default function TaskDetail({ assignments }: TaskDetailProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {assignments.map((a, i) => {
        const config = statusConfig[a.status];
        return (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-gray-800 bg-gray-900 p-5"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-medium text-white">
                  {a.display_name}
                </h3>
                <p className="text-xs text-gray-500">{a.email}</p>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}
              >
                {config.label}
              </span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-2 rounded-lg bg-gray-800/50">
                <div className="text-lg font-bold text-white tabular-nums">
                  {a.attempts.length}
                </div>
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  Attempts
                </div>
              </div>
              <div className="text-center p-2 rounded-lg bg-gray-800/50">
                <div
                  className={`text-lg font-bold tabular-nums ${
                    a.best_score != null && a.best_score >= 7
                      ? "text-green-400"
                      : a.best_score != null && a.best_score >= 5
                      ? "text-amber-400"
                      : "text-gray-400"
                  }`}
                >
                  {a.best_score != null ? a.best_score.toFixed(1) : "—"}
                </div>
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                  <Trophy className="w-3 h-3" />
                  Best Score
                </div>
              </div>
              <div className="text-center p-2 rounded-lg bg-gray-800/50">
                <div className="text-lg font-bold text-gray-300">
                  {a.completed_at ? formatTime(a.completed_at) : "—"}
                </div>
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                  <CheckCircle className="w-3 h-3" />
                  Completed
                </div>
              </div>
            </div>

            {/* Attempts timeline */}
            {a.attempts.length > 0 ? (
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Attempts
                </h4>
                <div className="space-y-1.5">
                  {a.attempts.map((att) => (
                    <AttemptRow key={att.id} attempt={att} />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-3">
                No attempts yet
              </p>
            )}
          </motion.div>
        );
      })}
      {assignments.length === 0 && (
        <div className="col-span-full text-center py-12 text-gray-500">
          No members assigned to this task.
        </div>
      )}
    </div>
  );
}
