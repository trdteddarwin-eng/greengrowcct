"use client";

import { useState, useEffect } from "react";

interface PersonaData {
  name: string;
  role: string;
  company: string;
  description: string;
  behavior: string;
  hook: string;
  icon: string;
}

interface PersonaEditorProps {
  documentText: string;
  industry: string;
  difficulty: string;
  persona: PersonaData | null;
  scenarioName: string;
  onPersonaChange: (persona: PersonaData) => void;
  onScenarioNameChange: (name: string) => void;
}

export default function PersonaEditor({
  documentText,
  industry,
  difficulty,
  persona,
  scenarioName,
  onPersonaChange,
  onScenarioNameChange,
}: PersonaEditorProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!persona && documentText && industry && difficulty) {
      generatePersona();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generatePersona() {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentText, industry, difficulty }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate persona");
      }

      const data = await res.json();

      onPersonaChange({
        name: data.prospectName || "Unknown",
        role: data.prospectRole || "Decision Maker",
        company: data.prospectCompany || "Unknown Company",
        description: data.description || "",
        behavior: data.prospectBehavior || "",
        hook: data.hook || "",
        icon: data.icon || "🎯",
      });
      onScenarioNameChange(data.scenarioName || "Custom Scenario");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate persona");
    } finally {
      setGenerating(false);
    }
  }

  function updateField(field: keyof PersonaData, value: string) {
    if (!persona) return;
    onPersonaChange({ ...persona, [field]: value });
  }

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">
          Generating prospect persona from your document...
        </p>
        <p className="text-xs text-gray-500">This may take a few seconds</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
        <button
          type="button"
          onClick={generatePersona}
          className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!persona) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Edit Prospect Persona
          </h3>
          <p className="text-sm text-gray-400">
            AI-generated from your document. Edit any field to customize.
          </p>
        </div>
        <button
          type="button"
          onClick={generatePersona}
          className="px-3 py-1.5 rounded-lg border border-gray-700 text-xs text-gray-300 hover:bg-gray-800 transition-colors"
        >
          Regenerate
        </button>
      </div>

      {/* Scenario Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Scenario Name
        </label>
        <input
          type="text"
          value={scenarioName}
          onChange={(e) => onScenarioNameChange(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-gray-200 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
      </div>

      {/* Icon + Name + Role + Company in a grid */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Icon
          </label>
          <input
            type="text"
            value={persona.icon}
            onChange={(e) => updateField("icon", e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-center text-2xl focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>
        <div className="col-span-10">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Prospect Name
          </label>
          <input
            type="text"
            value={persona.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-gray-200 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Role
          </label>
          <input
            type="text"
            value={persona.role}
            onChange={(e) => updateField("role", e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-gray-200 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Company
          </label>
          <input
            type="text"
            value={persona.company}
            onChange={(e) => updateField("company", e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-gray-200 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Scenario Description
        </label>
        <textarea
          value={persona.description}
          onChange={(e) => updateField("description", e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-200 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
        />
      </div>

      {/* Behavior */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Prospect Behavior Instructions
        </label>
        <textarea
          value={persona.behavior}
          onChange={(e) => updateField("behavior", e.target.value)}
          rows={5}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-200 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
        />
      </div>

      {/* Hook */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Industry Hook
        </label>
        <input
          type="text"
          value={persona.hook}
          onChange={(e) => updateField("hook", e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-gray-200 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
      </div>
    </div>
  );
}
