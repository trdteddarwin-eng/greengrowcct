"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ResearchResult } from "@/lib/types";
import ResearchResults from "@/components/ResearchResults";

type ResearchState = "idle" | "scraping" | "analyzing" | "done" | "error";

export default function ResearchPage() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<ResearchState>("idle");
  const [research, setResearch] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!url.trim()) return;

    // Auto-prefix https if missing
    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = "https://" + normalizedUrl;
      setUrl(normalizedUrl);
    }

    setState("scraping");
    setError(null);
    setResearch(null);

    try {
      // Step 1: Scrape URL
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

      // Step 2: Analyze with Gemini
      setState("analyzing");

      const researchRes = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteText: scrapeData.text,
          url: normalizedUrl,
        }),
      });

      const researchData = await researchRes.json();

      if (!researchRes.ok) {
        throw new Error(researchData.error || "Failed to analyze website");
      }

      setResearch(researchData.research);
      setState("done");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setState("error");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && state !== "scraping" && state !== "analyzing") {
      handleAnalyze();
    }
  }

  const isLoading = state === "scraping" || state === "analyzing";

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Pre-Call <span className="text-green-500">Research</span>
          </h1>
          <p className="mt-2 text-gray-400 text-sm">
            Paste a business website URL to generate talking points, marketing
            angles, and a custom opener.
          </p>
        </div>

        {/* URL Input */}
        <div className="flex gap-3 mb-8">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com"
            disabled={isLoading}
            className="flex-1 rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 transition-colors"
          />
          <motion.button
            type="button"
            whileHover={!isLoading ? { scale: 1.02 } : undefined}
            whileTap={!isLoading ? { scale: 0.98 } : undefined}
            onClick={handleAnalyze}
            disabled={isLoading || !url.trim()}
            className="px-6 py-3 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? "Analyzing..." : "Analyze"}
          </motion.button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center py-16">
            <motion.div
              className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-gray-400 text-sm">
              {state === "scraping"
                ? "Fetching website content..."
                : "Analyzing with AI..."}
            </p>
          </div>
        )}

        {/* Error */}
        {state === "error" && error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        {state === "done" && research && (
          <ResearchResults research={research} />
        )}
      </div>
    </div>
  );
}
