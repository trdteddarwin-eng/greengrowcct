"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ScoreChart from "@/components/ScoreChart";
import CallHistory from "@/components/CallHistory";
import { getCallHistory, clearHistory } from "@/lib/storage";
import type { CallSession } from "@/lib/types";

export default function HistoryPage() {
  const [history, setHistory] = useState<CallSession[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const data = getCallHistory();
    setHistory(data);
    setLoaded(true);
  }, []);

  function handleClearHistory() {
    const confirmed = window.confirm(
      "Are you sure you want to clear your entire call history? This cannot be undone."
    );
    if (confirmed) {
      clearHistory();
      setHistory([]);
    }
  }

  // Empty state
  if (loaded && history.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 max-w-md">
          <div className="text-5xl mb-4">&#x1F4DE;</div>
          <h2 className="text-xl font-semibold text-gray-200 mb-2">
            No Calls Yet
          </h2>
          <p className="text-gray-400 mb-6">
            Complete your first practice call to see your history and performance trends here.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            Start Practicing
          </a>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Call <span className="text-green-500">History</span>
          </h1>
          <p className="mt-2 text-gray-400">
            Track your progress and review past performance.
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="px-4 py-2 text-sm bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-500/30 rounded-lg transition-colors"
          >
            Clear History
          </button>
        )}
      </div>

      {/* Score Chart */}
      {history.length > 0 && (
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <ScoreChart history={history} />
        </motion.div>
      )}

      {/* Call History List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <CallHistory history={history} />
      </motion.div>
    </motion.div>
  );
}
