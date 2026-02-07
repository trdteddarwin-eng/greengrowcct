"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PlaybookEditor from "@/components/PlaybookEditor";
import { getPlaybook, savePlaybook } from "@/lib/storage";
import { defaultPlaybook } from "@/lib/default-playbook";

export default function PlaybookPage() {
  const [playbookText, setPlaybookText] = useState<string>("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = getPlaybook();
    setPlaybookText(stored);
  }, []);

  function handleSave(text: string) {
    savePlaybook(text);
    setPlaybookText(text);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Your <span className="text-green-500">Playbook</span>
        </h1>
        <p className="mt-2 text-gray-400">
          Customize your call script and framework. The AI will score your calls against
          this playbook.
        </p>
      </div>

      {/* Save Confirmation Toast */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-6 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm font-medium"
        >
          Playbook saved successfully.
        </motion.div>
      )}

      {/* Editor */}
      <div className="mb-12">
        <PlaybookEditor
          initialText={playbookText}
          onSave={handleSave}
        />
      </div>

      {/* Default Playbook Reference */}
      <div className="border-t border-gray-800 pt-10">
        <h2 className="text-xl font-semibold mb-2 text-gray-300">
          Default Playbook Reference
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Use this as a starting point. Each step outlines a phase of a well-structured cold call.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {defaultPlaybook.steps.map((step, index) => (
            <div
              key={step.name}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-green-500/20 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center justify-center h-7 w-7 rounded-full bg-green-500/10 text-green-500 text-xs font-bold">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-gray-200">{step.name}</h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">{step.description}</p>
              <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Example
                </p>
                <p className="text-sm text-gray-300 italic">
                  &ldquo;{step.example}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
