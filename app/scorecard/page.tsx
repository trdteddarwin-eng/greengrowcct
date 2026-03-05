"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { XCircle } from "lucide-react";
import ScorecardDisplay from "@/components/Scorecard";
import { getPlaybook, saveCall } from "@/lib/storage";
import type { Scorecard, TranscriptTurn, CallSession } from "@/lib/types";
import { trackEvent } from "@/lib/tracking";

interface PendingScoreData {
  transcript: TranscriptTurn[];
  scenarioId: string;
  scenarioName: string;
  taskId?: string;
  assignmentId?: string;
}

function ScorecardPageContent() {
  const router = useRouter();
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingData, setPendingData] = useState<PendingScoreData | null>(null);

  const fetchScore = useCallback(async (data: PendingScoreData) => {
    try {
      setLoading(true);
      setError(null);

      const playbookText = await getPlaybook();

      const response = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: data.transcript,
          scenarioId: data.scenarioId,
          scenarioName: data.scenarioName,
          playbookText: playbookText,
        }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || `Scoring failed (HTTP ${response.status})`);
      }

      const result = await response.json();
      const sc: Scorecard = result.scorecard;
      setScorecard(sc);

      // Save the call to history
      const callSession: CallSession = {
        id: crypto.randomUUID(),
        scenarioId: data.scenarioId,
        scenarioName: data.scenarioName,
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        durationSeconds: data.transcript.length > 0
          ? Math.round(data.transcript[data.transcript.length - 1].timestamp / 1000)
          : 0,
        transcript: data.transcript,
        scorecard: sc,
      };
      await saveCall(callSession);

      // Record task attempt if this call was for a task
      if (data.taskId && data.assignmentId) {
        try {
          await fetch(`/api/tasks/${data.taskId}/attempt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              assignment_id: data.assignmentId,
              score: sc.overallScore,
              duration_seconds: callSession.durationSeconds,
            }),
          });
        } catch {
          // Silently fail — task tracking shouldn't block the scorecard
        }

        trackEvent({
          eventType: "task_attempt_completed",
          metadata: {
            taskId: data.taskId,
            assignmentId: data.assignmentId,
            scenarioId: data.scenarioId,
            score: sc.overallScore,
          },
        });
      }

      // Track call scored
      trackEvent({
        eventType: "call_scored",
        metadata: {
          scenarioId: data.scenarioId,
          scenarioName: data.scenarioName,
          score: sc.overallScore,
        },
      });

      // Clear the pending data from sessionStorage
      sessionStorage.removeItem("cct-pending-score");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem("cct-pending-score");
    if (!raw) {
      setError("No call data found. Please complete a call first.");
      setLoading(false);
      return;
    }

    try {
      const data: PendingScoreData = JSON.parse(raw);
      setPendingData(data);
      fetchScore(data);
    } catch {
      setError("Invalid call data. Please try again.");
      setLoading(false);
    }
  }, [fetchScore]);

  // Loading state
  if (loading) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-[60vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-green-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-green-500/20 animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-200">
              Analyzing your call...
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Our AI is reviewing your transcript and generating a detailed scorecard.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="bg-gray-900 border border-red-500/30 rounded-xl p-8 max-w-md">
          <div className="flex justify-center mb-4">
            <XCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-red-400 mb-2">
            Scoring Error
          </h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            {pendingData && (
              <button
                onClick={() => fetchScore(pendingData)}
                className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded-xl border border-gray-700 transition-colors cursor-pointer"
              >
                Retry
              </button>
            )}
            <button
              onClick={() => router.push("/")}
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-green-500/20 cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Scorecard display
  if (!scorecard) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ScorecardDisplay scorecard={scorecard} scenarioName={pendingData?.scenarioName || "Practice Call"} />

      <div className="flex gap-4 justify-center mt-10 mb-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-green-500/20 cursor-pointer"
        >
          Practice Again
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/history")}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold rounded-xl border border-gray-700 transition-colors cursor-pointer"
        >
          View History
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function ScorecardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent" />
        </div>
      }
    >
      <ScorecardPageContent />
    </Suspense>
  );
}
