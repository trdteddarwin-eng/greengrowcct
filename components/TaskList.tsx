"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ClipboardList, ArrowRight } from "lucide-react";
import TaskCard from "@/components/TaskCard";
import type { UserTask } from "@/lib/types";

interface TaskListProps {
  tasks: UserTask[];
  onTaskClick: (task: UserTask) => void;
  loading?: boolean;
}

export default function TaskList({ tasks, onTaskClick, loading }: TaskListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-500 border-t-transparent" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-800 bg-gray-900/30 p-8 text-center">
        <div className="mb-3 flex justify-center">
          <ClipboardList className="w-10 h-10 text-gray-600" strokeWidth={1.5} />
        </div>
        <h3 className="text-base font-medium text-gray-400 mb-1">
          No tasks assigned yet
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Your manager hasn&apos;t assigned any tasks. You can still practice on your own.
        </p>
        <Link
          href="/practice"
          className="group/btn inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Free Practice
          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {tasks.map((task) => (
        <TaskCard key={task.assignment_id} task={task} onClick={onTaskClick} />
      ))}
    </motion.div>
  );
}
