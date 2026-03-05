"use client";

import { motion } from "framer-motion";
import { RefreshCw, Star, Calendar } from "lucide-react";
import type { UserTask } from "@/lib/types";

interface TaskCardProps {
  task: UserTask;
  onClick: (task: UserTask) => void;
}

const statusConfig = {
  pending: { label: "Pending", bg: "bg-gray-800", text: "text-gray-400", border: "border-gray-700" },
  in_progress: { label: "In Progress", bg: "bg-amber-950", text: "text-amber-400", border: "border-amber-800" },
  completed: { label: "Completed", bg: "bg-green-950", text: "text-green-400", border: "border-green-800" },
};

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const config = statusConfig[task.assignment_status];
  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.assignment_status !== "completed";

  return (
    <motion.button
      type="button"
      onClick={() => onClick(task)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group/card w-full text-left rounded-xl border border-gray-800 bg-gray-900 p-5 transition-shadow hover:shadow-lg hover:shadow-green-500/5 hover:border-gray-700 cursor-pointer"
    >
      {/* Top row: status + due date */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}
        >
          {config.label}
        </span>
        {task.due_date && (
          <span
            className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-400" : "text-gray-500"}`}
          >
            <Calendar className="w-3 h-3" />
            {isOverdue ? "Overdue" : `Due ${new Date(task.due_date).toLocaleDateString()}`}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-white mb-1 transition-transform group-hover/card:translate-x-0.5">
        {task.title}
      </h3>

      {/* Scenario */}
      <p className="text-sm text-gray-400 mb-3">
        {task.scenario_name}
      </p>

      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Bottom stats */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <RefreshCw className="w-3.5 h-3.5" />
          {task.attempt_count} attempt{task.attempt_count !== 1 ? "s" : ""}
        </span>
        {task.best_score != null && (
          <span
            className={`flex items-center gap-1 font-medium ${
              task.best_score >= 7
                ? "text-green-400"
                : task.best_score >= 5
                ? "text-amber-400"
                : "text-red-400"
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            Best: {task.best_score.toFixed(1)}
          </span>
        )}
      </div>
    </motion.button>
  );
}
