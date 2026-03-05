"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, ChevronRight } from "lucide-react";
import type { AdminTask } from "@/lib/types";

interface TasksTableProps {
  tasks: AdminTask[];
}

function relativeDate(iso: string | null): string {
  if (!iso) return "No due date";
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / 86400000);

  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays <= 7) return `Due in ${diffDays}d`;
  return date.toLocaleDateString();
}

export default function TasksTable({ tasks }: TasksTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900 shadow-soft">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
              Task
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 hidden md:table-cell">
              Scenario
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 hidden lg:table-cell">
              Due Date
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
              Progress
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 hidden md:table-cell">
              Avg Score
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 hidden lg:table-cell">
              Status
            </th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, i) => {
            const progress =
              task.total_assigned > 0
                ? Math.round((task.completed_count / task.total_assigned) * 100)
                : 0;

            return (
              <motion.tr
                key={task.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => router.push(`/admin/tasks/${task.id}`)}
                className="group border-b border-gray-800/50 cursor-pointer hover:bg-gray-800/40 transition-colors"
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{task.title}</p>
                  {task.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {task.description}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                  {task.scenario_name}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span
                    className={`inline-flex items-center gap-1.5 text-sm ${
                      task.due_date && new Date(task.due_date) < new Date()
                        ? "text-red-400"
                        : "text-gray-400"
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    {relativeDate(task.due_date)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 tabular-nums">
                      {task.completed_count}/{task.total_assigned}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell tabular-nums">
                  <span
                    className={
                      task.avg_score != null && task.avg_score >= 7
                        ? "text-green-400"
                        : task.avg_score != null && task.avg_score >= 5
                        ? "text-amber-400"
                        : "text-gray-400"
                    }
                  >
                    {task.avg_score != null ? task.avg_score.toFixed(1) : "—"}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      task.status === "active"
                        ? "bg-green-950 text-green-400 border border-green-800"
                        : "bg-gray-800 text-gray-400 border border-gray-700"
                    }`}
                  >
                    {task.status}
                  </span>
                </td>
                <td className="pr-3">
                  <ChevronRight className="w-4 h-4 text-gray-700 transition-colors group-hover:text-gray-400" />
                </td>
              </motion.tr>
            );
          })}
          {tasks.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                No tasks yet. Create one to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
