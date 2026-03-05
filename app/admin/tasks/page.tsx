"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import TasksTable from "@/components/admin/TasksTable";
import CreateTaskForm from "@/components/admin/CreateTaskForm";
import type { AdminTask } from "@/lib/types";

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  async function loadTasks() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks ?? []);
      }
    } catch {
      // silently fail
    }
    setLoading(false);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Task Management</h1>
          <p className="text-base text-gray-400 mt-2">
            Assign practice scenarios to your team members for effective cold call training.
          </p>
        </div>
        <AnimatePresence mode="wait">
          {!showCreate && (
            <motion.button
              key="create-button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowCreate(true)}
              className="mt-6 sm:mt-0 flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Create New Task
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Create form */}
      <AnimatePresence mode="wait">
        {showCreate && (
          <motion.div
            key="create-form"
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-12 rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              Create New Training Task
            </h2>
            <CreateTaskForm
              onCreated={() => {
                setShowCreate(false);
                loadTasks();
              }}
              onCancel={() => setShowCreate(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks table */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-white mb-6">All Assigned Tasks</h2>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {tasks.length > 0 ? (
              <motion.div
                key="tasks-table"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <TasksTable tasks={tasks} />
              </motion.div>
            ) : (
              <motion.div
                key="no-tasks"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="text-center py-16 text-gray-500 text-lg rounded-xl border border-gray-800 bg-gray-900/50"
              >
                <p className="mb-4">No tasks assigned yet.</p>
                <p>Click &quot;Create New Task&quot; to get started!</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
