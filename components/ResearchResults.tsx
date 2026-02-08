"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ResearchResult } from "@/lib/types";

interface ResearchResultsProps {
  research: ResearchResult;
}

export default function ResearchResults({ research }: ResearchResultsProps) {
  const [openerCopied, setOpenerCopied] = useState(false);

  async function copyOpener() {
    try {
      await navigator.clipboard.writeText(research.suggestedOpener);
      setOpenerCopied(true);
      setTimeout(() => setOpenerCopied(false), 2000);
    } catch {
      // Fallback — clipboard API may not be available
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Business Summary */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
        <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
          Business Summary
        </h3>
        <h2 className="text-xl font-bold text-white mb-2">
          {research.businessName}
        </h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          {research.businessSummary}
        </p>
      </div>

      {/* Suggested Opener */}
      <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-medium uppercase tracking-wider text-green-400">
            Suggested Opener
          </h3>
          <button
            type="button"
            onClick={copyOpener}
            className="px-3 py-1 text-xs rounded-md bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors cursor-pointer"
          >
            {openerCopied ? "Copied!" : "Copy"}
          </button>
        </div>
        <p className="text-green-100 text-sm leading-relaxed italic">
          &ldquo;{research.suggestedOpener}&rdquo;
        </p>
      </div>

      {/* Two-column grid: Talking Points + Pain Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Talking Points */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
          <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3">
            Talking Points
          </h3>
          <ol className="space-y-2">
            {research.talkingPoints.map((point, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-300">
                <span className="text-green-500 font-mono text-xs mt-0.5 shrink-0">
                  {i + 1}.
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Pain Points */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
          <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3">
            Pain Points
          </h3>
          <ul className="space-y-2">
            {research.painPoints.map((point, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-300">
                <span className="text-red-400 mt-0.5 shrink-0">&#x2022;</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Marketing Angles */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
        <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3">
          Marketing Angles
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {research.marketingAngles.map((angle, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-700 bg-gray-800/50 p-3"
            >
              <p className="text-sm font-medium text-white mb-1">
                {angle.service}
              </p>
              <p className="text-xs text-gray-400">{angle.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Approach */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
        <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
          Suggested Approach
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          {research.suggestedApproach}
        </p>
      </div>
    </motion.div>
  );
}
