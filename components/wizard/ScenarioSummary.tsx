"use client";

import type { Difficulty } from "@/lib/types";

interface PersonaData {
  name: string;
  role: string;
  company: string;
  description: string;
  behavior: string;
  hook: string;
  icon: string;
}

interface ScenarioSummaryProps {
  scenarioName: string;
  industry: string;
  difficulty: Difficulty;
  persona: PersonaData;
  documentName: string;
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

export default function ScenarioSummary({
  scenarioName,
  industry,
  difficulty,
  persona,
  documentName,
}: ScenarioSummaryProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Review Your Scenario
        </h3>
        <p className="text-sm text-gray-400">
          Review the details below before saving your custom scenario.
        </p>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{persona.icon}</span>
            <div>
              <h4 className="text-lg font-semibold text-white">
                {scenarioName}
              </h4>
              <p className="text-sm text-gray-400">{industry}</p>
            </div>
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getDifficultyColor(
              difficulty
            )}`}
          >
            {difficulty}
          </span>
        </div>

        {/* Prospect Info */}
        <div className="border-t border-gray-800 pt-4">
          <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Prospect
          </h5>
          <p className="text-sm text-white">
            {persona.name}, {persona.role} at {persona.company}
          </p>
        </div>

        {/* Description */}
        <div className="border-t border-gray-800 pt-4">
          <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Description
          </h5>
          <p className="text-sm text-gray-300">{persona.description}</p>
        </div>

        {/* Behavior */}
        <div className="border-t border-gray-800 pt-4">
          <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Prospect Behavior
          </h5>
          <p className="text-sm text-gray-300 whitespace-pre-wrap">
            {persona.behavior}
          </p>
        </div>

        {/* Hook */}
        {persona.hook && (
          <div className="border-t border-gray-800 pt-4">
            <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Industry Hook
            </h5>
            <p className="text-sm text-gray-300">{persona.hook}</p>
          </div>
        )}

        {/* Document */}
        {documentName && (
          <div className="border-t border-gray-800 pt-4">
            <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Source Document
            </h5>
            <p className="text-sm text-gray-300">{documentName}</p>
          </div>
        )}
      </div>
    </div>
  );
}
