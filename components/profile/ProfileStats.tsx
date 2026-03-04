"use client";

import { motion } from "framer-motion";

interface ProfileStatsProps {
  totalCalls: number;
  avgScore: number;
  bestScore: number;
  streak: number;
}

function scoreColor(score: number): string {
  if (score === 0) return "text-gray-500";
  if (score < 4) return "text-red-400";
  if (score < 7) return "text-yellow-400";
  return "text-green-400";
}

export default function ProfileStats({
  totalCalls,
  avgScore,
  bestScore,
  streak,
}: ProfileStatsProps) {
  const cards = [
    { label: "Total Calls", value: totalCalls.toString(), color: "text-green-500" },
    { label: "Avg Score", value: avgScore.toFixed(1), color: scoreColor(avgScore) },
    { label: "Best Score", value: bestScore.toFixed(1), color: scoreColor(bestScore) },
    { label: "Streak", value: streak.toString(), color: "text-green-500" },
  ];

  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center hover:border-green-500/30 transition-colors"
        >
          <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
          <div className="text-sm text-gray-400 mt-1">{card.label}</div>
        </div>
      ))}
    </motion.div>
  );
}
