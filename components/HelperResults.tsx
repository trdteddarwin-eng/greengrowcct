"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HelperResult } from "@/lib/types";
import { Clipboard, Check, Lightbulb, TrendingUp, ShieldCheck, Target, MessageSquareQuote, AlertCircle } from 'lucide-react';

type Tab = "intel" | "pain_points" | "objections";

const CopyButton = ({ textToCopy }: { textToCopy: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-gray-500 hover:text-green-400 transition-colors cursor-pointer"
      aria-label="Copy to clipboard"
    >
      {copied ? <Check size={16} className="text-green-500" /> : <Clipboard size={16} />}
    </button>
  );
};

const ScriptBlock = ({ title, content }: { title: string, content: string }) => (
  <div className="bg-gray-900 rounded-lg p-4 relative">
    <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-2">{title}</h4>
    <p className="text-gray-300 whitespace-pre-wrap pr-6">{content}</p>
    <div className="absolute top-3 right-3">
      <CopyButton textToCopy={content} />
    </div>
  </div>
);

const InfoCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
            <div className="text-green-500">{icon}</div>
            <h4 className="font-semibold text-gray-200">{title}</h4>
        </div>
        <div className="text-gray-400 text-sm pl-8">{children}</div>
    </div>
);


export default function HelperResults({ results }: { results: HelperResult }) {
  const [activeTab, setActiveTab] = useState<Tab>("intel");

  const fullScript = Object.values(results.coldCallScript).join("\n\n");

  const tabContent = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-7xl mx-auto"
    >
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">{results.businessName}</h1>
          <p className="text-gray-400 mt-1">{results.suggestedApproach}</p>
        </div>
        <span className="mt-3 sm:mt-0 text-sm font-medium self-start inline-block bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20">
          {results.industry}
        </span>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column: Script */}
        <div className="lg:col-span-3 bg-gray-900/50 border border-gray-800 rounded-xl p-6 h-fit">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Cold Call Script</h2>
                <CopyButton textToCopy={fullScript} />
            </div>
          <div className="space-y-4">
            {Object.entries(results.coldCallScript).map(([key, value]) => (
              <ScriptBlock key={key} title={key.replace(/([A-Z])/g, ' $1')} content={value} />
            ))}
          </div>
        </div>

        {/* Right Column: Tabs */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-1.5 flex items-center gap-2 mb-6">
            {(["intel", "pain_points", "objections"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-center text-sm font-medium py-2 rounded-lg transition-colors duration-200 cursor-pointer capitalize ${
                  activeTab === tab ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.replace("_", " ")}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                variants={tabContent}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="space-y-4"
            >
              {activeTab === "intel" && (
                <>
                  <InfoCard icon={<Lightbulb size={18} />} title="Recommended Service">
                    <p className="font-semibold text-gray-300">{results.recommendedService}</p>
                    <p className="mt-1">{results.whyThisService}</p>
                  </InfoCard>
                  <InfoCard icon={<TrendingUp size={18} />} title="ROI Projection">
                    <p>{results.roiProjection}</p>
                  </InfoCard>
                  <InfoCard icon={<ShieldCheck size={18} />} title="Social Proof">
                    <p>{results.socialProof}</p>
                  </InfoCard>
                  <InfoCard icon={<MessageSquareQuote size={18} />} title="Business Summary">
                    <p>{results.businessSummary}</p>
                  </InfoCard>
                </>
              )}

              {activeTab === "pain_points" && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Pain Points</h3>
                    <ul className="space-y-3">
                        {results.painPoints.map((point, i) => (
                            <motion.li
                                key={i}
                                className="flex items-start gap-3"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Target size={16} className="text-green-500 mt-1 flex-shrink-0" />
                                <span className="text-gray-300">{point}</span>
                            </motion.li>
                        ))}
                    </ul>
                    <h3 className="text-lg font-bold text-white mb-4 mt-8">Talking Points</h3>
                    <ul className="space-y-3">
                        {results.talkingPoints.map((point, i) => (
                            <motion.li
                                key={i}
                                className="flex items-start gap-3"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <MessageSquareQuote size={16} className="text-blue-400 mt-1 flex-shrink-0" />
                                <span className="text-gray-300">{point}</span>
                            </motion.li>
                        ))}
                    </ul>
                </div>
              )}

              {activeTab === "objections" && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Likely Objections</h3>
                    <div className="space-y-4">
                        {results.likelyObjections.map((obj, i) => (
                            <motion.div
                                key={i}
                                className="bg-gray-800/50 p-4 rounded-lg"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <p className="font-semibold text-gray-200 flex items-center gap-2">
                                <AlertCircle size={16} className="text-yellow-400" />
                                {obj.objection}
                                </p>
                                <p className="mt-2 text-sm text-gray-400 pl-8 border-l-2 border-gray-700 ml-2 py-1">
                                {obj.response}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
