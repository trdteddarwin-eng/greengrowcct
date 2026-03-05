"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ScenarioPicker from "@/components/ScenarioPicker";
import type { Scenario, CustomScenarioData } from "@/lib/types";
import { customScenarioToScenario } from "@/lib/types";

export default function PracticePage() {
  const router = useRouter();
  const [customScenarios, setCustomScenarios] = useState<Scenario[]>([]);

  useEffect(() => {
    async function fetchCustomScenarios() {
      try {
        const res = await fetch("/api/scenarios");
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Free Practice</h1>
        <p className="text-gray-400 mt-2">
          Choose any scenario and start practicing on your own.
        </p>
      </div>

      <ScenarioPicker onSelect={handleScenarioSelect} customScenarios={customScenarios} />
    </motion.div>
  );
}
