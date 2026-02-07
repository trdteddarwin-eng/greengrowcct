"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import type { CustomScenarioData } from "@/lib/types";
import { getBrowserId } from "@/lib/storage";

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "Easy":
      return "bg-green-500/15 text-green-400 border-green-500/30";
    case "Medium":
      return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
    case "Hard":
      return "bg-red-500/15 text-red-400 border-red-500/30";
    default:
      return "bg-gray-500/15 text-gray-400 border-gray-500/30";
  }
}

export default function ScenariosPage() {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<CustomScenarioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchScenarios();
  }, []);

  async function fetchScenarios() {
    try {
      const browserId = getBrowserId();
      const res = await fetch(`/api/scenarios?browser_id=${browserId}`);
      if (res.ok) {
        const data = await res.json();
        setScenarios(data.scenarios || []);
      }
    } catch (err) {
      console.error("Failed to fetch scenarios:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this scenario?")) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/scenarios/${id}`, { method: "DELETE" });
      if (res.ok) {
        setScenarios((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete scenario:", err);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between py-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Custom Scenarios
          </h1>
          <p className="mt-2 text-gray-400">
            Create and manage your own training scenarios
          </p>
        </div>
        <Link
          href="/scenarios/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
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
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Create New
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : scenarios.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-gray-800 bg-gray-900/50">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No custom scenarios yet
          </h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Create your first custom scenario by uploading a business document.
            The AI will generate a realistic prospect persona.
          </p>
          <Link
            href="/scenarios/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            Create Your First Scenario
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-3xl">{scenario.icon}</span>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getDifficultyColor(
                    scenario.difficulty
                  )}`}
                >
                  {scenario.difficulty}
                </span>
              </div>

              <h3 className="text-base font-semibold text-white mb-1">
                {scenario.name}
              </h3>
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                {scenario.description}
              </p>

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>
                  {scenario.prospect_name}, {scenario.prospect_role}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/call?scenario=custom_${scenario.id}`)
                  }
                  className="flex-1 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors"
                >
                  Practice
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(scenario.id)}
                  disabled={deleting === scenario.id}
                  className="px-3 py-2 rounded-lg border border-gray-700 text-xs text-gray-400 hover:text-red-400 hover:border-red-500/30 transition-colors disabled:opacity-50"
                >
                  {deleting === scenario.id ? "..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
