"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ScenarioPicker from "@/components/ScenarioPicker";
import { getCallHistory, getBrowserId } from "@/lib/storage";
import type { CallSession, CustomScenarioData, Scenario } from "@/lib/types";
import { customScenarioToScenario } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCalls: 0,
    avgScore: 0,
    bestScore: 0,
    streak: 0,
  });
  const [customScenarios, setCustomScenarios] = useState<Scenario[]>([]);

  useEffect(() => {
    const history: CallSession[] = getCallHistory();
    if (history.length === 0) {
      setStats({ totalCalls: 0, avgScore: 0, bestScore: 0, streak: 0 });
      return;
    }

    const scores = history
      .filter((c) => c.scorecard)
      .map((c) => c.scorecard!.overallScore);

    const totalCalls = history.length;
    const avgScore = scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : 0;
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

    // Streak: consecutive calls with score >= 7 from the most recent
    let streak = 0;
    const sortedByDate = [...history]
      .filter((c) => c.scorecard)
      .sort((a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime());
    for (const call of sortedByDate) {
      if (call.scorecard && call.scorecard.overallScore >= 7) {
        streak++;
      } else {
        break;
      }
    }

    setStats({ totalCalls, avgScore, bestScore, streak });
  }, []);

  useEffect(() => {
    async function fetchCustomScenarios() {
      try {
        const browserId = getBrowserId();
        if (!browserId) return;
        const res = await fetch(`/api/scenarios?browser_id=${browserId}`);
        if (res.ok) {
          const data = await res.json();
          const mapped = (data.scenarios as CustomScenarioData[]).map(customScenarioToScenario);
          setCustomScenarios(mapped);
        }
      } catch {
        // Silently fail — custom scenarios are optional
      }
    }
    fetchCustomScenarios();
  }, []);

  function handleScenarioSelect(scenario: Scenario) {
    router.push(`/call?scenario=${scenario.id}`);
  }

  const statCards = [
    { label: "Total Calls", value: stats.totalCalls, icon: "phone" },
    { label: "Average Score", value: stats.avgScore.toFixed(1), icon: "chart" },
    { label: "Best Score", value: stats.bestScore.toFixed(1), icon: "trophy" },
    { label: "Streak", value: stats.streak, icon: "fire" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Cold Call{" "}
          <span className="text-green-500">Trainer</span>
        </h1>
        <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
          Practice makes perfect. Choose a scenario and start calling.
        </p>
      </div>

      {/* Quick Stats */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center hover:border-green-500/30 transition-colors"
          >
            <div className="text-2xl font-bold text-green-500">
              {stat.value}
            </div>
            <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Scenario Picker */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-2xl font-semibold mb-6">Choose a Scenario</h2>
        <ScenarioPicker onSelect={handleScenarioSelect} customScenarios={customScenarios} />
      </motion.div>
    </motion.div>
  );
}
