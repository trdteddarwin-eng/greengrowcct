"use client";

import { motion } from "framer-motion";
import ObjectionBank from "@/components/ObjectionBank";

export default function ObjectionsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Objection <span className="text-green-500">Bank</span>
        </h1>
        <p className="mt-2 text-gray-400 max-w-2xl">
          Study these responses before your next call. Each objection includes two
          proven response strategies so you can adapt to any situation on the fly.
        </p>
      </div>

      {/* Intro Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-10">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-0.5 h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <span className="text-green-500 text-lg">&#x1F4A1;</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-200 mb-1">How to Use This</h3>
            <p className="text-sm text-gray-400">
              Review common objections prospects raise during cold calls and memorize the
              suggested responses. During practice calls, the AI prospect will use
              similar objections -- knowing these patterns will help you stay confident
              and keep the conversation moving forward.
            </p>
          </div>
        </div>
      </div>

      {/* Objection Bank Component */}
      <ObjectionBank />
    </motion.div>
  );
}
