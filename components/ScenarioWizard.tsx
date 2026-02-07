"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Difficulty } from "@/lib/types";
import { getBrowserId } from "@/lib/storage";
import DocumentUpload from "@/components/wizard/DocumentUpload";
import ScenarioConfig from "@/components/wizard/ScenarioConfig";
import PersonaEditor from "@/components/wizard/PersonaEditor";
import ScenarioSummary from "@/components/wizard/ScenarioSummary";

interface PersonaData {
  name: string;
  role: string;
  company: string;
  description: string;
  behavior: string;
  hook: string;
  icon: string;
}

const STEPS = ["Document", "Configure", "Persona", "Review"];

export default function ScenarioWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wizard state
  const [documentText, setDocumentText] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [industry, setIndustry] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [persona, setPersona] = useState<PersonaData | null>(null);
  const [scenarioName, setScenarioName] = useState("");

  function canProceed(): boolean {
    switch (step) {
      case 0:
        return documentText.length > 0;
      case 1:
        return industry.length > 0;
      case 2:
        return persona !== null && scenarioName.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  }

  async function handleSave() {
    if (!persona) return;

    setSaving(true);
    setError(null);

    try {
      const browserId = getBrowserId();

      const res = await fetch("/api/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          browser_id: browserId,
          name: scenarioName,
          difficulty,
          industry,
          prospect_name: persona.name,
          prospect_role: persona.role,
          prospect_company: persona.company,
          description: persona.description,
          prospect_behavior: persona.behavior,
          hook: persona.hook,
          icon: persona.icon,
          document_context: documentText || null,
          document_name: documentName || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save scenario");
      }

      router.push("/scenarios");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save scenario");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                i < step
                  ? "bg-green-500 text-white"
                  : i === step
                  ? "bg-green-500/20 text-green-400 border border-green-500"
                  : "bg-gray-800 text-gray-500 border border-gray-700"
              }`}
            >
              {i < step ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-xs hidden sm:block ${
                i <= step ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-px ${
                  i < step ? "bg-green-500" : "bg-gray-800"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {step === 0 && (
            <DocumentUpload
              documentText={documentText}
              documentName={documentName}
              onDocumentChange={(text, name) => {
                setDocumentText(text);
                setDocumentName(name);
              }}
            />
          )}
          {step === 1 && (
            <ScenarioConfig
              industry={industry}
              difficulty={difficulty}
              onIndustryChange={setIndustry}
              onDifficultyChange={setDifficulty}
            />
          )}
          {step === 2 && (
            <PersonaEditor
              documentText={documentText}
              industry={industry}
              difficulty={difficulty}
              persona={persona}
              scenarioName={scenarioName}
              onPersonaChange={setPersona}
              onScenarioNameChange={setScenarioName}
            />
          )}
          {step === 3 && persona && (
            <ScenarioSummary
              scenarioName={scenarioName}
              industry={industry}
              difficulty={difficulty}
              persona={persona}
              documentName={documentName}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-800">
        <button
          type="button"
          onClick={() => step === 0 ? router.push("/scenarios") : setStep(step - 1)}
          className="px-5 py-2.5 rounded-lg border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
        >
          {step === 0 ? "Cancel" : "Back"}
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              canProceed()
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Scenario"}
          </button>
        )}
      </div>
    </div>
  );
}
