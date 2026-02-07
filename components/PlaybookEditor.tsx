"use client";

import { useState, useEffect, useCallback } from "react";
import { defaultPlaybookText } from "@/lib/default-playbook";

interface PlaybookEditorProps {
  initialText: string;
  onSave: (text: string) => void;
}

const PLACEHOLDER_TEXT = `Enter your cold call playbook here...

Example structure:
1. OPENER: Introduce yourself and state the reason for calling
2. VALUE PROP: Explain how your solution helps
3. QUALIFYING QUESTIONS: Ask about their current situation
4. OBJECTION HANDLING: Address common pushbacks
5. CLOSE: Ask for the next step (meeting, demo, etc.)

The AI will evaluate your calls against this playbook.`;

export default function PlaybookEditor({
  initialText,
  onSave,
}: PlaybookEditorProps) {
  const [text, setText] = useState(initialText);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setText(initialText);
    setIsDirty(false);
  }, [initialText]);

  const handleSave = useCallback(() => {
    onSave(text);
    setIsDirty(false);
  }, [text, onSave]);

  const handleReset = useCallback(() => {
    setText(defaultPlaybookText);
    setIsDirty(true);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
      setIsDirty(true);
    },
    []
  );

  return (
    <div className="space-y-4">
      {/* Textarea */}
      <div className="relative">
        <textarea
          value={text}
          onChange={handleChange}
          placeholder={PLACEHOLDER_TEXT}
          rows={20}
          className="w-full rounded-xl border border-gray-800 bg-gray-900/50 px-5 py-4 text-sm text-gray-200 font-mono leading-relaxed placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/50 resize-y min-h-[300px]"
          spellCheck={false}
        />
      </div>

      {/* Footer: character count + buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {text.length.toLocaleString()} characters
          </span>
          {isDirty && (
            <span className="text-xs text-amber-400">Unsaved changes</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 border border-gray-800 hover:text-white hover:border-gray-700 hover:bg-gray-800/50 transition-colors cursor-pointer"
          >
            Reset to Default
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 rounded-lg text-sm font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors shadow-sm shadow-green-500/20 cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>

    </div>
  );
}
