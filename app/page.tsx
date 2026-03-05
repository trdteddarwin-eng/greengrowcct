"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, TrendingUp, Trophy, Flame, ArrowRight } from "lucide-react";
import LocalDataMigration from "@/components/LocalDataMigration";
import TaskList from "@/components/TaskList";
import { getCallHistory } from "@/lib/storage";
import { trackEvent } from "@/lib/tracking";
import type { CallSession, UserTask } from "@/lib/types";

const statIcons = {
  phone: Phone,
  chart: TrendingUp,
  trophy: Trophy,
  fire: Flame,
} as const;

export default function HomePage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCalls: 0,
    avgScore: 0,
    bestScore: 0,
    streak: 0,
  });
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const history: CallSession[] = await getCallHistory();
      if (history.length === 0) {
        setStats({ totalCalls: 0, avgScore: 0, bestScore: 0, streak: 0 });
        return;
      }

      const scores = history
        .filter((c) => c.scorecard)
        .map((c) => c.scorecard!.overallScore);

      const totalCalls = history.length;
      const avgScore = scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : 0;
      const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

      // Streak: consecutive calls with score >= 7 from the most recent
      let streak = 0;
      const sortedByDate = [...history]
        .filter((c) => c.scorecard)
        .sort((a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime());
      for (const call of sortedByDate) {
        if (call.scorecard && call.scorecard.overallScore >= 7) {
          streak++;
        } else {
          break;
        }
      }

      setStats({ totalCalls, avgScore, bestScore, streak });
    }
    loadStats();
  }, []);

  useEffect(() => {
    async function loadTasks() {
      try {
        const res = await fetch("/api/tasks");
        if (res.ok) {
          const data = await res.json();
          setTasks(data.tasks ?? []);
        }
      } catch {
        // silently fail
      }
      setTasksLoading(false);
    }
    loadTasks();
  }, []);

  function handleTaskClick(task: UserTask) {
    trackEvent({
      eventType: "task_clicked",
      metadata: {
        taskId: task.id,
        assignmentId: task.assignment_id,
        scenarioId: task.scenario_id,
      },
    });
    router.push(
      `/call?scenario=${task.scenario_id}&task=${task.id}&assignment=${task.assignment_id}`
    );
  }

  const statCards = [
    { label: "Total Calls", value: stats.totalCalls, icon: "phone" as const },
    { label: "Average Score", value: stats.avgScore.toFixed(1), icon: "chart" as const },
    { label: "Best Score", value: stats.bestScore.toFixed(1), icon: "trophy" as const },
    { label: "Streak", value: stats.streak, icon: "fire" as const },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Local Data Migration Banner */}
      <LocalDataMigration />

      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Cold Call{" "}
          <span className="text-green-500">Trainer</span>
        </h1>
        <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
          Complete your assigned tasks or start a free practice.
        </p>
      </div>

      {/* Quick Stats */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        {statCards.map((stat) => {
          const IconComponent = statIcons[stat.icon];
          return (
            <div
              key={stat.label}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center hover:border-green-500/30 transition-colors"
            >
              <div className="flex justify-center mb-2">
                <IconComponent className="w-5 h-5 text-gray-500" />
              </div>
              <div className="text-3xl font-bold text-green-500">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            </div>
          );
        })}
      </motion.div>

      {/* Assigned Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Your Tasks</h2>
          <Link
            href="/practice"
            className="group/link flex items-center gap-1.5 text-sm text-green-400 hover:text-green-300 transition-colors"
          >
            Free Practice
            <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
          </Link>
        </div>
        <TaskList tasks={tasks} onTaskClick={handleTaskClick} loading={tasksLoading} />
      </motion.div>
    </motion.div>
  );
}
