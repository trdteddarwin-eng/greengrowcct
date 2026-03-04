"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import StatsCards from "@/components/admin/StatsCards";
import ActivityFeed from "@/components/admin/ActivityFeed";

interface OverviewData {
  totalUsers: number;
  totalCalls: number;
  callsToday: number;
  avgScore: number;
  activeToday: number;
  callsByDay: { date: string; count: number }[];
  recentActivity: {
    id: string;
    userId: string;
    displayName: string;
    eventType: string;
    metadata: Record<string, unknown>;
    pagePath: string | null;
    createdAt: string;
  }[];
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load overview");
        return r.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="text-center py-12 text-red-400">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent" />
      </div>
    );
  }

  // Chart dimensions
  const maxCount = Math.max(...data.callsByDay.map((d) => d.count), 1);

  return (
    <div className="space-y-8">
      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor user activity and app performance
        </p>
      </motion.div>

      {/* First row: 3 stat cards */}
      <StatsCards
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        cards={[
          {
            label: "Total Users",
            value: data.totalUsers,
            sub: "Last 30 days",
            color: "green",
          },
          {
            label: "Total Calls",
            value: data.totalCalls,
            sub: "Last 30 days",
            color: "blue",
          },
          {
            label: "Active Today",
            value: data.activeToday,
            sub: "Currently online",
            color: "purple",
          },
        ]}
      />

      {/* Second row: 2 wider stat cards */}
      <StatsCards
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        cards={[
          {
            label: "Avg Score",
            value: data.avgScore > 0 ? data.avgScore.toFixed(1) : "—",
            sub: "Across all calls",
            color: "amber",
          },
          {
            label: "Calls Today",
            value: data.callsToday,
            sub: "Since midnight",
            color: "blue",
          },
        ]}
      />

      {/* Third row: chart + activity side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-day calls chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-800 bg-gray-900 p-5 shadow-soft"
        >
          <h3 className="text-sm font-medium text-gray-400 mb-4">
            Calls — Last 7 Days
          </h3>
          <div className="flex items-end justify-between gap-2 h-32">
            {data.callsByDay.map((day) => {
              const height =
                maxCount > 0 ? (day.count / maxCount) * 100 : 0;
              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-xs text-gray-400 tabular-nums">
                    {day.count}
                  </span>
                  <div
                    className="w-full rounded-t bg-green-500/60 transition-all duration-300"
                    style={{
                      height: `${Math.max(height, 4)}%`,
                      minHeight: "2px",
                    }}
                  />
                  <span className="text-[10px] text-gray-600">
                    {new Date(day.date + "T12:00:00").toLocaleDateString(
                      "en-US",
                      { weekday: "short" }
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent activity */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-gray-800 bg-gray-900 p-5 shadow-soft"
        >
          <h3 className="text-sm font-medium text-gray-400 mb-3">
            Recent Activity
          </h3>
          <ActivityFeed
            events={data.recentActivity}
            maxHeight="max-h-[340px]"
          />
        </motion.div>
      </div>
    </div>
  );
}
