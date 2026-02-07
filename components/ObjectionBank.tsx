"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { objections } from "@/lib/objections";
import type { ObjectionEntry } from "@/lib/types";

function ObjectionCard({ entry }: { entry: ObjectionEntry }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"a" | "b">("a");

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
      {/* Header - clickable to expand */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-gray-800/30 transition-colors cursor-pointer"
      >
        <div className="flex items-start gap-3 min-w-0">
          <span className="text-red-400 mt-0.5 flex-shrink-0">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </span>
          <p className="text-sm font-semibold text-white leading-relaxed">
            &ldquo;{entry.objection}&rdquo;
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 flex-shrink-0 mt-1 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expandable response area */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-gray-800">
              {/* Tabs */}
              <div className="flex gap-1 mb-4 mt-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("a")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === "a"
                      ? "bg-green-500/15 text-green-400 border border-green-500/30"
                      : "text-gray-500 hover:text-gray-300 border border-transparent"
                  }`}
                >
                  Response A
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("b")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === "b"
                      ? "bg-green-500/15 text-green-400 border border-green-500/30"
                      : "text-gray-500 hover:text-gray-300 border border-transparent"
                  }`}
                >
                  Response B
                </button>
              </div>

              {/* Response content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: activeTab === "a" ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: activeTab === "a" ? 10 : -10 }}
                  transition={{ duration: 0.15 }}
                  className="rounded-lg bg-gray-800/50 border border-gray-700/50 p-4"
                >
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {activeTab === "a" ? entry.responseA : entry.responseB}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ObjectionBank() {
  return (
    <div className="space-y-3">
      {objections.length === 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-12 text-center">
          <p className="text-sm text-gray-500">
            No objections have been added yet.
          </p>
        </div>
      )}
      {objections.map((entry) => (
        <ObjectionCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
