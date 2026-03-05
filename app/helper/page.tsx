"use client";

import { useState, useRef, FormEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HelperResult } from "@/lib/types";
import HelperResults from "@/components/HelperResults";
import { WandSparkles, ArrowRight, AlertTriangle, Loader, RefreshCw } from "lucide-react";

type Status = "idle" | "scraping" | "analyzing" | "done" | "error";

const statusMessages: Record<Status, string> = {
  idle: "",
  scraping: "Scraping website for context...",
  analyzing: "Analyzing data and generating script...",
  done: "All done!",
  error: "Something went wrong.",
};

const LoadingIndicator = ({ status }: { status: Status }) => (
  <motion.div
    key="loading"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="text-center flex flex-col items-center justify-center h-full py-20"
  >
    <Loader className="animate-spin text-green-500 mb-4" size={48} />
    <p className="text-lg text-gray-300">{statusMessages[status]}</p>
  </motion.div>
);

const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <motion.div
    key="error"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="text-center bg-red-900/20 border border-red-500/30 rounded-lg p-8 max-w-2xl mx-auto"
  >
    <AlertTriangle className="text-red-400 mx-auto mb-4" size={40} />
    <h2 className="text-2xl font-bold text-red-300 mb-2">An Error Occurred</h2>
    <p className="text-red-400 mb-6">{error}</p>
    <button
      onClick={onRetry}
      className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 mx-auto cursor-pointer"
    >
      <RefreshCw size={16} />
      Try Again
    </button>
  </motion.div>
);

export default function HelperPage() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<HelperResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'idle' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [status]);

  const resetState = () => {
    setStatus("idle");
    setResults(null);
    setError(null);
    setUrl("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    // Auto-prefix https if missing
    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = "https://" + normalizedUrl;
      setUrl(normalizedUrl);
    }

    setError(null);
    setResults(null);

    try {
      // Step 1: Scrape URL
      setStatus("scraping");
      const scrapeRes = await fetch("/api/scrape-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      const scrapeData = await scrapeRes.json();

      if (!scrapeRes.ok) {
        throw new Error(scrapeData.error || "Failed to fetch website");
      }

      if (!scrapeData.text) {
        throw new Error("No content found on this page");
      }

      // Step 2: Analyze with AI
      setStatus("analyzing");
      const helperRes = await fetch("/api/helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteText: scrapeData.text,
          url: normalizedUrl,
        }),
      });

      const helperData = await helperRes.json();

      if (!helperRes.ok) {
        throw new Error(helperData.error || "Failed to analyze website");
      }

      setResults(helperData.research);
      setStatus("done");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setStatus("error");
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="max-w-3xl mx-auto text-center pt-16"
          >
            <WandSparkles className="mx-auto text-green-400 mb-4" size={48} />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
              Call <span className="text-green-500">Helper</span>
            </h1>
            <p className="text-lg text-gray-400 mb-10">
              Enter a company&apos;s website to generate a personalized cold call script, talking points, and key intel.
            </p>
            <form onSubmit={handleSubmit} className="relative">
              <input
                ref={inputRef}
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full pl-6 pr-36 py-4 bg-gray-900 border border-gray-700 text-white rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!url.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-500 text-gray-950 font-bold py-2.5 px-6 rounded-full flex items-center gap-2 hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Generate <ArrowRight size={16} />
              </button>
            </form>
          </motion.div>
        )}

        {(status === "scraping" || status === "analyzing") && (
          <LoadingIndicator status={status} />
        )}

        {status === "error" && error && (
          <ErrorDisplay error={error} onRetry={resetState} />
        )}

        {status === "done" && results && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex justify-end mb-4">
              <button
                onClick={resetState}
                className="bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw size={16} />
                Start New
              </button>
            </div>
            <HelperResults results={results} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
