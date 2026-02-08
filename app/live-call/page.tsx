"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import type {
  TranscriptTurn,
  AudioCaptureHandle,
  LiveSuggestion,
} from "@/lib/types";
import { getPlaybook } from "@/lib/storage";
import { createAudioCapture } from "@/lib/audio-capture";
import {
  createGeminiListenSession,
  type GeminiListenSessionHandle,
} from "@/lib/gemini-listen";
import CoachingPanel from "@/components/CoachingPanel";

type CallState = "idle" | "connecting" | "active" | "ending";

const SUGGEST_INTERVAL_MS = 15000;

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export default function LiveCallPage() {
  const [callState, setCallState] = useState<CallState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [suggestions, setSuggestions] = useState<LiveSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [businessContext, setBusinessContext] = useState("");
  const [contextUrl, setContextUrl] = useState("");
  const [loadingContext, setLoadingContext] = useState(false);

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const suggestRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const captureRef = useRef<AudioCaptureHandle | null>(null);
  const sessionRef = useRef<GeminiListenSessionHandle | null>(null);
  const transcriptRef = useRef<TranscriptTurn[]>([]);
  const lastTranscriptLenRef = useRef(0);
  const playbookRef = useRef("");

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Timer
  useEffect(() => {
    if (callState === "active") {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [callState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cleanup() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (suggestRef.current) {
      clearInterval(suggestRef.current);
      suggestRef.current = null;
    }
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (captureRef.current) {
      captureRef.current.stop();
      captureRef.current = null;
    }
  }

  async function fetchSuggestions() {
    const currentTranscript = transcriptRef.current;
    const currentLen = currentTranscript.reduce(
      (sum, t) => sum + t.text.length,
      0
    );

    // Only fetch if transcript has grown since last check
    if (currentLen <= lastTranscriptLenRef.current || currentLen < 20) return;
    lastTranscriptLenRef.current = currentLen;

    const formattedTranscript = currentTranscript
      .map(
        (turn) =>
          `[${turn.role === "rep" ? "SALES REP" : "PROSPECT"}]: ${turn.text}`
      )
      .join("\n");

    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: formattedTranscript,
          playbookText: playbookRef.current,
          businessContext: businessContext || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions);
      }
    } catch {
      // Silently fail — suggestions are non-critical
    }
  }

  const startListening = useCallback(async () => {
    setCallState("connecting");
    setError(null);
    setTranscript([]);
    setElapsed(0);
    setSuggestions(null);
    lastTranscriptLenRef.current = 0;

    try {
      // 1. Fetch ephemeral token
      const tokenRes = await fetch("/api/token", { method: "POST" });
      if (!tokenRes.ok) throw new Error("Failed to get session token");
      const { token } = await tokenRes.json();

      // 2. Get playbook
      const playbookText = await getPlaybook();
      playbookRef.current = playbookText;

      // 3. Create listen session
      const session = await createGeminiListenSession({
        token,
        onTranscriptUpdate: (turns: TranscriptTurn[]) => {
          setTranscript([...turns]);
        },
        onConnectionChange: (connected: boolean) => {
          if (connected) {
            setCallState("active");
          }
        },
        onError: (errorMsg: string) => {
          setError(errorMsg);
          setCallState("idle");
          cleanup();
        },
      });
      sessionRef.current = session;

      // 4. Create audio capture and start streaming
      const capture = createAudioCapture((base64: string) => {
        if (sessionRef.current) {
          sessionRef.current.sendAudio(base64);
        }
      });
      captureRef.current = capture;
      await capture.start();

      // 5. Start suggestion interval
      suggestRef.current = setInterval(fetchSuggestions, SUGGEST_INTERVAL_MS);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to start listening";
      setError(message);
      setCallState("idle");
      cleanup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessContext]);

  const stopListening = useCallback(() => {
    setCallState("ending");
    cleanup();
    setTimeout(() => {
      setCallState("idle");
    }, 500);
  }, []);

  async function loadBusinessContext() {
    if (!contextUrl.trim()) return;

    let normalizedUrl = contextUrl.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = "https://" + normalizedUrl;
      setContextUrl(normalizedUrl);
    }

    setLoadingContext(true);
    try {
      const scrapeRes = await fetch("/api/scrape-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl }),
      });
      const scrapeData = await scrapeRes.json();

      if (scrapeRes.ok && scrapeData.text) {
        // Get research summary for context
        const researchRes = await fetch("/api/research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            websiteText: scrapeData.text,
            url: normalizedUrl,
          }),
        });
        const researchData = await researchRes.json();

        if (researchRes.ok && researchData.research) {
          const r = researchData.research;
          setBusinessContext(
            `Business: ${r.businessName}\nSummary: ${r.businessSummary}\nPain Points: ${r.painPoints.join("; ")}\nMarketing Angles: ${r.marketingAngles.map((a: { service: string; reason: string }) => a.service).join(", ")}`
          );
        }
      }
    } catch {
      // Non-critical — continue without context
    } finally {
      setLoadingContext(false);
    }
  }

  const isListening = callState === "active";

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">
            Live Call <span className="text-amber-500">Assistant</span>
          </h1>
          <p className="mt-2 text-gray-400 text-sm">
            Listen to your real calls and get coaching suggestions in real-time.
          </p>
        </div>

        {/* Optional: Business context loader */}
        {callState === "idle" && (
          <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900/50 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Optional: Load business context for targeted suggestions
            </p>
            <div className="flex gap-2">
              <input
                type="url"
                value={contextUrl}
                onChange={(e) => setContextUrl(e.target.value)}
                placeholder="https://business-website.com"
                className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
              />
              <button
                type="button"
                onClick={loadBusinessContext}
                disabled={loadingContext || !contextUrl.trim()}
                className="px-4 py-2 rounded-lg bg-gray-700 text-sm text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {loadingContext ? "Loading..." : "Load"}
              </button>
            </div>
            {businessContext && (
              <p className="mt-2 text-xs text-green-400">
                Business context loaded
              </p>
            )}
          </div>
        )}

        {/* Main layout: transcript + coaching */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left: Transcript (60%) */}
          <div className="lg:w-3/5">
            {/* Call status bar */}
            <div className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/50 p-4 mb-4">
              <div className="flex items-center gap-3">
                {callState === "active" && (
                  <motion.div
                    className="w-3 h-3 rounded-full bg-green-500"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                {callState === "connecting" && (
                  <motion.div
                    className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                )}
                {callState === "idle" && (
                  <div className="w-3 h-3 rounded-full bg-gray-600" />
                )}
                {callState === "ending" && (
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                )}

                <span className="text-sm text-gray-300">
                  {callState === "idle" && "Ready to listen"}
                  {callState === "connecting" && "Connecting..."}
                  {callState === "active" && "Listening"}
                  {callState === "ending" && "Stopping..."}
                </span>
              </div>

              {(callState === "active" || callState === "ending") && (
                <p className="text-lg font-mono text-white tabular-nums">
                  {formatTime(elapsed)}
                </p>
              )}
            </div>

            {/* Transcript */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/30 mb-4 overflow-hidden">
              <div className="h-[400px] lg:h-[500px] overflow-y-auto p-4 space-y-3">
                {transcript.length === 0 && callState !== "idle" && (
                  <p className="text-gray-500 text-sm text-center py-8">
                    Waiting for speech...
                  </p>
                )}
                {transcript.length === 0 && callState === "idle" && (
                  <p className="text-gray-500 text-sm text-center py-8">
                    Start listening to see the transcript
                  </p>
                )}
                {transcript.map((turn, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${
                      turn.role === "rep" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        turn.role === "rep"
                          ? "bg-green-500/10 text-green-100 border border-green-500/20"
                          : "bg-gray-800 text-gray-200 border border-gray-700"
                      }`}
                    >
                      <p className="text-xs font-medium mb-1 opacity-60">
                        {turn.role === "rep" ? "You" : "Prospect"}
                      </p>
                      <p>{turn.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={transcriptEndRef} />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Action button */}
            <div className="flex justify-center">
              {callState === "idle" && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startListening}
                  className="px-8 py-3 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Start Listening
                </motion.button>
              )}
              {callState === "connecting" && (
                <button
                  type="button"
                  disabled
                  className="px-8 py-3 rounded-xl bg-gray-700 text-gray-400 font-semibold text-sm cursor-not-allowed"
                >
                  Connecting...
                </button>
              )}
              {callState === "active" && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={stopListening}
                  className="px-8 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 cursor-pointer"
                >
                  Stop Listening
                </motion.button>
              )}
            </div>
          </div>

          {/* Right: Coaching Panel (40%) */}
          <div className="lg:w-2/5 lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Coaching Suggestions
            </h2>
            <CoachingPanel
              suggestions={suggestions}
              isListening={isListening}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
