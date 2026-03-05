"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import TaskDetail from "@/components/admin/TaskDetail";
import type { Task, AdminTaskAssignment } from "@/lib/types";

export default function AdminTaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [assignments, setAssignments] = useState<AdminTaskAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/tasks/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTask(data.task);
          setAssignments(data.assignments ?? []);
        }
      } catch {
        // silently fail
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleArchive() {
    if (!task) return;
    setArchiving(true);
    const newStatus = task.status === "active" ? "archived" : "active";
    try {
      const res = await fetch(`/api/admin/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTask((prev) => (prev ? { ...prev, status: newStatus } : prev));
      }
    } catch {
      // silently fail
    }
    setArchiving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-20 text-gray-500">Task not found.</div>
    );
  }

  const completedCount = assignments.filter((a) => a.status === "completed").length;
  const totalAttempts = assignments.reduce((sum, a) => sum + a.attempts.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Back button */}
      <button
        onClick={() => router.push("/admin/tasks")}
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to Tasks
      </button>

      {/* Task header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{task.title}</h1>
          {task.description && (
            <p className="text-sm text-gray-400 mt-1">{task.description}</p>
          )}
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <span>Scenario: {task.scenario_name}</span>
            {task.due_date && (
              <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        <button
          onClick={handleArchive}
          disabled={archiving}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
            task.status === "active"
              ? "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
              : "bg-green-950 text-green-400 border-green-800 hover:bg-green-900"
          }`}
        >
          {task.status === "active" ? "Archive" : "Reactivate"}
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white tabular-nums">
            {completedCount}/{assignments.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">Completed</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white tabular-nums">
            {totalAttempts}
          </div>
          <div className="text-xs text-gray-500 mt-1">Total Attempts</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400 tabular-nums">
            {(() => {
              const scores = assignments
                .filter((a) => a.best_score != null)
                .map((a) => a.best_score!);
              if (scores.length === 0) return "—";
              return (
                Math.round(
                  (scores.reduce((a, b) => a + b, 0) / scores.length) * 10
                ) / 10
              ).toFixed(1);
            })()}
          </div>
          <div className="text-xs text-gray-500 mt-1">Avg Best Score</div>
        </div>
      </div>

      {/* Assignment detail */}
      <h2 className="text-lg font-semibold text-white mb-4">
        Team Members
      </h2>
      <TaskDetail assignments={assignments} />
    </motion.div>
  );
}
