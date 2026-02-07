"use client";

import { motion } from "framer-motion";
import ScenarioWizard from "@/components/ScenarioWizard";

export default function CreateScenarioPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Create Custom Scenario
        </h1>
        <p className="mt-2 text-gray-400">
          Upload a document and let AI generate a realistic prospect persona
        </p>
      </div>
      <ScenarioWizard />
    </motion.div>
  );
}
