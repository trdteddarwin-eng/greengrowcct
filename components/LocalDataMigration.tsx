"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { defaultPlaybookText } from "@/lib/default-playbook";
import type { CallSession } from "@/lib/types";

const PLAYBOOK_KEY = "cct-playbook";
const CALL_HISTORY_KEY = "cct-call-history";

export default function LocalDataMigration() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    const hasPlaybook = localStorage.getItem(PLAYBOOK_KEY);
    const hasHistory = localStorage.getItem(CALL_HISTORY_KEY);
    return !!(hasPlaybook || hasHistory);
  });
  const [migrating, setMigrating] = useState(false);

  if (!visible || !user) return null;

  async function handleMigrate() {
    if (!user) return;
    setMigrating(true);

    try {
      const supabase = createClient();

      // Migrate playbook
      const storedPlaybook = localStorage.getItem(PLAYBOOK_KEY);
      if (storedPlaybook && storedPlaybook !== defaultPlaybookText) {
        await supabase.from("playbooks").upsert(
          { user_id: user.id, text: storedPlaybook, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
      }

      // Migrate call history
      const storedHistory = localStorage.getItem(CALL_HISTORY_KEY);
      if (storedHistory) {
        try {
          const history: CallSession[] = JSON.parse(storedHistory);
          if (history.length > 0) {
            const rows = history.map((s) => ({
              user_id: user.id,
              scenario_id: s.scenarioId,
              scenario_name: s.scenarioName,
              started_at: s.startedAt,
              ended_at: s.endedAt,
              duration_seconds: s.durationSeconds,
              transcript: s.transcript,
              scorecard: s.scorecard ?? null,
            }));
            await supabase.from("call_sessions").insert(rows);
          }
        } catch {
          // Invalid JSON in localStorage, skip
        }
      }

      // Clear localStorage after successful migration
      localStorage.removeItem(PLAYBOOK_KEY);
      localStorage.removeItem(CALL_HISTORY_KEY);
      localStorage.removeItem("cct-browser-id");
      setVisible(false);
    } catch (err) {
      console.error("Migration failed:", err);
    } finally {
      setMigrating(false);
    }
  }

  function handleDismiss() {
    setVisible(false);
  }

  return (
    <div className="mb-6 px-4 py-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-between gap-4">
      <p className="text-blue-300 text-sm">
        We found local data from a previous session. Import it to your account?
      </p>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={handleMigrate}
          disabled={migrating}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded-md transition-colors"
        >
          {migrating ? "Importing..." : "Import"}
        </button>
        <button
          onClick={handleDismiss}
          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded-md transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
