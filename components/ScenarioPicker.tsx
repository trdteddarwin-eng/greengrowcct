"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { scenarios } from "@/lib/scenarios";
import type { Scenario } from "@/lib/types";

interface ScenarioPickerProps {
  onSelect: (scenario: Scenario) => void;
  customScenarios?: Scenario[];
}

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

function ScenarioCard({
  scenario,
  onSelect,
}: {
  scenario: Scenario;
  onSelect: (scenario: Scenario) => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(scenario)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left rounded-xl border border-gray-800 bg-gray-900/50 p-5 transition-shadow hover:shadow-lg hover:shadow-green-500/5 hover:border-gray-700 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-3xl" role="img" aria-label={scenario.name}>
          {scenario.icon}
        </span>
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

      <p className="text-sm text-gray-400 mb-3">
        {scenario.description}
      </p>

      <div className="flex items-center gap-2 text-xs text-gray-500">
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
          {scenario.prospectName}, {scenario.prospectRole}
        </span>
      </div>
    </motion.button>
  );
}

export default function ScenarioPicker({ onSelect, customScenarios = [] }: ScenarioPickerProps) {
  const generalScenarios = scenarios.filter((s) => s.category === "general");
  const industryScenarios = scenarios.filter((s) => s.category === "industry");

  return (
    <div className="space-y-10">
      {/* Custom Scenarios */}
      {customScenarios.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
              Custom Scenarios
            </h2>
            <Link
              href="/scenarios"
              className="text-xs text-gray-400 hover:text-green-400 transition-colors"
            >
              Manage
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customScenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onSelect={onSelect}
              />
            ))}
            <Link
              href="/scenarios/create"
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-700 bg-gray-900/30 p-5 hover:border-green-500/50 hover:bg-green-500/5 transition-colors min-h-[180px]"
            >
              <svg
                className="w-8 h-8 text-gray-500 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              <span className="text-sm text-gray-400">Create New</span>
            </Link>
          </div>
        </section>
      )}

      {/* Create prompt when no custom scenarios exist */}
      {customScenarios.length === 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
              Custom Scenarios
            </h2>
          </div>
          <Link
            href="/scenarios/create"
            className="flex items-center gap-4 rounded-xl border-2 border-dashed border-gray-700 bg-gray-900/30 p-5 hover:border-green-500/50 hover:bg-green-500/5 transition-colors"
          >
            <svg
              className="w-8 h-8 text-gray-500 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-300">Create a Custom Scenario</p>
              <p className="text-xs text-gray-500">Upload a document and let AI generate a realistic prospect</p>
            </div>
          </Link>
        </section>
      )}

      {/* General Scenarios */}
      {generalScenarios.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
            General Scenarios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generalScenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onSelect={onSelect}
              />
            ))}
          </div>
        </section>
      )}

      {/* Industry Scenarios */}
      {industryScenarios.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
            Industry Scenarios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {industryScenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onSelect={onSelect}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
