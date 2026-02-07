"use client";

import type { Difficulty } from "@/lib/types";

const INDUSTRIES = [
  "Restaurant",
  "HVAC",
  "Dental",
  "Med Spa / Aesthetics",
  "Real Estate",
  "E-commerce / DTC",
  "Roofing",
  "SaaS",
  "Insurance",
  "Legal",
  "Automotive",
  "Healthcare",
  "Financial Services",
  "Other",
];

const DIFFICULTIES: { value: Difficulty; label: string; description: string }[] = [
  {
    value: "Easy",
    label: "Easy",
    description: "Prospect is open to conversation with minimal objections",
  },
  {
    value: "Medium",
    label: "Medium",
    description: "Prospect has default resistance but can be won over",
  },
  {
    value: "Hard",
    label: "Hard",
    description: "Prospect is deeply skeptical and will challenge every claim",
  },
];

interface ScenarioConfigProps {
  industry: string;
  difficulty: Difficulty;
  onIndustryChange: (industry: string) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
}

export default function ScenarioConfig({
  industry,
  difficulty,
  onIndustryChange,
  onDifficultyChange,
}: ScenarioConfigProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Configure Scenario
        </h3>
        <p className="text-sm text-gray-400">
          Choose the industry and difficulty level for your custom scenario.
        </p>
      </div>

      {/* Industry */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Industry
        </label>
        <select
          value={industry}
          onChange={(e) => onIndustryChange(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-200 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 appearance-none"
        >
          <option value="">Select an industry...</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Difficulty
        </label>
        <div className="space-y-3">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => onDifficultyChange(d.value)}
              className={`w-full text-left rounded-lg border p-4 transition-colors ${
                difficulty === d.value
                  ? "border-green-500 bg-green-500/10"
                  : "border-gray-700 bg-gray-900/50 hover:border-gray-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-medium ${
                    difficulty === d.value ? "text-green-400" : "text-gray-200"
                  }`}
                >
                  {d.label}
                </span>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    difficulty === d.value
                      ? "border-green-500"
                      : "border-gray-600"
                  }`}
                >
                  {difficulty === d.value && (
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">{d.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
