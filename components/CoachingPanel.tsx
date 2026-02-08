"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { LiveSuggestion } from "@/lib/types";

interface CoachingPanelProps {
  suggestions: LiveSuggestion | null;
  isListening: boolean;
}

export default function CoachingPanel({
  suggestions,
  isListening,
}: CoachingPanelProps) {
  if (!isListening && !suggestions) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 text-center">
        <p className="text-gray-500 text-sm">
          Start listening to get coaching suggestions
        </p>
      </div>
    );
  }

  if (isListening && !suggestions) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <div className="flex flex-col items-center py-4">
          <motion.div
            className="w-3 h-3 rounded-full bg-amber-500 mb-3"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <p className="text-gray-400 text-sm text-center">
            Listening... suggestions will appear after you start speaking
          </p>
        </div>
      </div>
    );
  }

  if (!suggestions) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={suggestions.whatToSayNext}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="space-y-3"
      >
        {/* What to Say Next */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-amber-400 mb-2">
            Say This Next
          </h3>
          <p className="text-amber-100 text-sm leading-relaxed">
            &ldquo;{suggestions.whatToSayNext}&rdquo;
          </p>
        </div>

        {/* Current Stage */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
              {suggestions.currentStage}
            </span>
          </div>
          <p className="text-gray-400 text-xs mt-1">
            {suggestions.stageGoal}
          </p>
        </div>

        {/* Quick Tips */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
            Quick Tips
          </h3>
          <div className="flex flex-wrap gap-2">
            {suggestions.quickTips.map((tip, i) => (
              <span
                key={i}
                className="px-2.5 py-1 text-xs rounded-full bg-gray-800 text-gray-300 border border-gray-700"
              >
                {tip}
              </span>
            ))}
          </div>
        </div>

        {/* Objection Alert */}
        {suggestions.objectionDetected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-red-500/30 bg-red-500/5 p-4"
          >
            <h3 className="text-xs font-medium uppercase tracking-wider text-red-400 mb-2">
              Objection Detected
            </h3>
            <p className="text-red-200 text-xs mb-2">
              &ldquo;{suggestions.objectionDetected.objection}&rdquo;
            </p>
            <div className="border-t border-red-500/20 pt-2 mt-2">
              <p className="text-xs text-gray-500 mb-1">Respond with:</p>
              <p className="text-red-100 text-sm leading-relaxed">
                &ldquo;{suggestions.objectionDetected.suggestedResponse}&rdquo;
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
