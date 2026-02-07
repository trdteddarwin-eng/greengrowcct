"use client";

import { motion } from "framer-motion";
import type { Scorecard as ScorecardType, DimensionScore } from "@/lib/types";

interface ScorecardProps {
  scorecard: ScorecardType;
  scenarioName: string;
}

function getScoreColor(score: number): string {
  if (score < 4) return "text-red-400";
  if (score <= 6) return "text-yellow-400";
  return "text-green-400";
}

function getScoreBarColor(score: number): string {
  if (score < 4) return "bg-red-500";
  if (score <= 6) return "bg-yellow-500";
  return "bg-green-500";
}

function getScoreRingColor(score: number): string {
  if (score < 4) return "#ef4444"; // red-500
  if (score <= 6) return "#eab308"; // yellow-500
  return "#22c55e"; // green-500
}

function CircularScore({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 10) * circumference;
  const color = getScoreRingColor(score);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-gray-800"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={`text-4xl font-bold ${getScoreColor(score)}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {score.toFixed(1)}
        </motion.span>
        <span className="text-xs text-gray-500 mt-0.5">out of 10</span>
      </div>
    </div>
  );
}

function DimensionCard({
  dim,
  index,
}: {
  dim: DimensionScore;
  index: number;
}) {
  const barWidth = (dim.score / 10) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
      className="rounded-xl border border-gray-800 bg-gray-900/50 p-5"
    >
      {/* Header: label + score */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">{dim.label}</h3>
        <span className={`text-lg font-bold ${getScoreColor(dim.score)}`}>
          {dim.score}
        </span>
      </div>

      {/* Score bar */}
      <div className="h-2 bg-gray-800 rounded-full mb-4 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${getScoreBarColor(dim.score)}`}
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
        />
      </div>

      {/* What went well / What to improve */}
      <div className="space-y-3 mb-4">
        {dim.whatWentWell && (
          <div>
            <p className="text-xs font-medium text-green-400 mb-1">
              What went well
            </p>
            <p className="text-xs text-gray-300 leading-relaxed">
              {dim.whatWentWell}
            </p>
          </div>
        )}
        {dim.whatToImprove && (
          <div>
            <p className="text-xs font-medium text-amber-400 mb-1">
              What to improve
            </p>
            <p className="text-xs text-gray-300 leading-relaxed">
              {dim.whatToImprove}
            </p>
          </div>
        )}
      </div>

      {/* Side-by-side comparison */}
      {(dim.exampleSaid || dim.shouldHaveSaid) && (
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-800">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 font-medium">
              What you said
            </p>
            <p className="text-xs text-gray-400 leading-relaxed italic">
              {dim.exampleSaid || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 font-medium">
              What you should have said
            </p>
            <p className="text-xs text-green-300/80 leading-relaxed italic">
              {dim.shouldHaveSaid || "N/A"}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function Scorecard({
  scorecard,
  scenarioName,
}: ScorecardProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header with overall score */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-sm text-gray-400 mb-1">Performance Review</p>
        <h1 className="text-xl font-bold text-white mb-6">{scenarioName}</h1>
        <CircularScore score={scorecard.overallScore} />
      </motion.div>

      {/* Top strength & improvement */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-4 h-4 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            <p className="text-xs font-semibold text-green-400 uppercase tracking-wider">
              Top Strength
            </p>
          </div>
          <p className="text-sm text-gray-300">{scorecard.topStrength}</p>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-4 h-4 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Top Improvement
            </p>
          </div>
          <p className="text-sm text-gray-300">{scorecard.topImprovement}</p>
        </div>
      </motion.div>

      {/* Dimension cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scorecard.dimensions.map((dim, i) => (
          <DimensionCard key={dim.dimension} dim={dim} index={i} />
        ))}
      </div>

      {/* Summary */}
      {scorecard.summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="rounded-xl border border-gray-800 bg-gray-900/50 p-5"
        >
          <h2 className="text-sm font-semibold text-white mb-2">Summary</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            {scorecard.summary}
          </p>
        </motion.div>
      )}
    </div>
  );
}
