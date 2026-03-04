"use client";

import { motion } from "framer-motion";

interface StatCard {
  label: string;
  value: string | number;
  sub?: string;
  color?: "green" | "blue" | "amber" | "purple";
}

interface StatsCardsProps {
  cards: StatCard[];
  className?: string;
}

const colorMap = {
  green: "border-green-800 bg-green-950/20 text-green-400",
  blue: "border-blue-800 bg-blue-950/20 text-blue-400",
  amber: "border-amber-800 bg-amber-950/20 text-amber-400",
  purple: "border-purple-800 bg-purple-950/20 text-purple-400",
};

export default function StatsCards({ cards, className }: StatsCardsProps) {
  return (
    <div className={className ?? "grid grid-cols-2 lg:grid-cols-4 gap-4"}>
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`rounded-2xl border p-5 shadow-soft ${
            colorMap[card.color ?? "green"]
          }`}
        >
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
            {card.label}
          </p>
          <p className="text-2xl font-bold text-white">{card.value}</p>
          {card.sub && (
            <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
