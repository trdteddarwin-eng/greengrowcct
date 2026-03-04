"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import ActivityTimeline from "@/components/profile/ActivityTimeline";
import ScoreChart from "@/components/ScoreChart";
import CallHistory from "@/components/CallHistory";
import { getCallHistory, getUserEvents } from "@/lib/storage";
import type { CallSession, UserEvent } from "@/lib/types";

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const [history, setHistory] = useState<CallSession[]>([]);
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (loading || !user) return;

    async function loadData() {
      const [calls, activity] = await Promise.all([
        getCallHistory(),
        getUserEvents(100),
      ]);
      setHistory(calls);
      setEvents(activity);
      setDataLoading(false);
    }
    loadData();
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="text-center py-20 text-gray-400">
        Please log in to view your profile.
      </div>
    );
  }

  // Compute stats
  const scores = history
    .filter((c) => c.scorecard)
    .map((c) => c.scorecard!.overallScore);

  const totalCalls = history.length;
  const avgScore =
    scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <ProfileHeader
        displayName={profile.display_name}
        email={user.email ?? ""}
        role={profile.role}
        createdAt={profile.created_at}
      />

      <ProfileStats
        totalCalls={totalCalls}
        avgScore={avgScore}
        bestScore={bestScore}
        streak={streak}
      />

      {/* Score Trend */}
      {!dataLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Score Trend</h2>
          <ScoreChart history={history} />
        </motion.div>
      )}

      {/* Two-column: Call History + Activity Timeline */}
      {!dataLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Call History</h2>
            <CallHistory history={history} />
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Activity</h2>
            <ActivityTimeline events={events} />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
