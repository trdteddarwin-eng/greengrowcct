"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import CallInterface from "@/components/CallInterface";
import { scenarios } from "@/lib/scenarios";
import { resolveScenario } from "@/lib/scenario-resolver";
import type { Scenario, TranscriptTurn } from "@/lib/types";

function CallPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const scenarioId = searchParams.get("scenario");
  const taskId = searchParams.get("task");
  const assignmentId = searchParams.get("assignment");

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [documentContext, setDocumentContext] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function resolve() {
      if (!scenarioId) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      try {
        const result = await resolveScenario(scenarioId);
        if (result) {
          setScenario(result.scenario);
          setDocumentContext(result.documentContext);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      }
      setLoading(false);
    }
    resolve();
  }, [scenarioId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent" />
      </div>
    );
  }

  if (notFound || !scenario) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="bg-gray-900 border border-red-500/30 rounded-xl p-8 max-w-md">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-red-400 mb-2">
            Scenario Not Found
          </h2>
          <p className="text-gray-400 mb-6">
            {scenarioId
              ? `No scenario found with ID "${scenarioId}".`
              : "No scenario was specified."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-green-500/20"
          >
            Back to Dashboard
          </Link>
        </div>
      </motion.div>
    );
  }

  function handleCallEnd(transcript: TranscriptTurn[]) {
    const pendingData: Record<string, unknown> = {
      transcript,
      scenarioId: scenario!.id,
      scenarioName: scenario!.name,
    };
    if (taskId) pendingData.taskId = taskId;
    if (assignmentId) pendingData.assignmentId = assignmentId;
    sessionStorage.setItem("cct-pending-score", JSON.stringify(pendingData));
    router.push("/scorecard");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <CallInterface scenario={scenario} onCallEnd={handleCallEnd} documentContext={documentContext} />
    </motion.div>
  );
}

export default function CallPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent" />
        </div>
      }
    >
      <CallPageContent />
    </Suspense>
  );
}
