"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  Scenario,
  TranscriptTurn,
  AudioCaptureHandle,
  AudioPlaybackHandle,
} from "@/lib/types";
import { getPlaybook } from "@/lib/storage";
import { getProspectSystemPrompt } from "@/lib/prompts";
import { createAudioCapture } from "@/lib/audio-capture";
import { createAudioPlayback } from "@/lib/audio-playback";
import { createGeminiLiveSession, type GeminiLiveSessionHandle } from "@/lib/gemini-live";
import AudioVisualizer from "@/components/AudioVisualizer";
import { trackEvent } from "@/lib/tracking";
import { Phone, PhoneOff, PhoneCall } from "lucide-react";

type CallState = "idle" | "connecting" | "active" | "ending";

interface CallInterfaceProps {
  scenario: Scenario;
  onCallEnd: (transcript: TranscriptTurn[]) => void;
  documentContext?: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export default function CallInterface({
  scenario,
  onCallEnd,
  documentContext,
}: CallInterfaceProps) {
  const [callState, setCallState] = useState<CallState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const captureRef = useRef<AudioCaptureHandle | null>(null);
  const playbackRef = useRef<AudioPlaybackHandle | null>(null);
  const sessionRef = useRef<GeminiLiveSessionHandle | null>(null);
  const transcriptRef = useRef<TranscriptTurn[]>([]);

  // Keep transcriptRef in sync
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Auto-scroll transcript
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
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (captureRef.current) {
      captureRef.current.stop();
      captureRef.current = null;
    }
    if (playbackRef.current) {
      playbackRef.current.stop();
      playbackRef.current = null;
    }
  }

  const startCall = useCallback(async () => {
    setCallState("connecting");
    setError(null);
    setTranscript([]);
    setElapsed(0);

    try {
      // 1. Fetch ephemeral token
      const tokenRes = await fetch("/api/token", { method: "POST" });
      if (!tokenRes.ok) {
        throw new Error("Failed to get session token");
      }
      const { token } = await tokenRes.json();

      // 2. Get playbook
      const playbookText = await getPlaybook();

      // 3. Build system prompt
      const systemInstruction = getProspectSystemPrompt(scenario, playbookText, documentContext);

      // 4. Create audio playback (before capture so analyser is ready)
      const playback = createAudioPlayback();
      playbackRef.current = playback;

      // 5. Create Gemini Live session
      const session = await createGeminiLiveSession({
        token,
        systemInstruction,
        voiceName: scenario.voice,
        onTranscriptUpdate: (turns: TranscriptTurn[]) => {
          setTranscript([...turns]);
        },
        onAudioData: (pcmData: ArrayBuffer) => {
          playback.enqueue(pcmData);
          // Update analyser node on first audio
          const node = playback.getAnalyserNode();
          if (node) {
            setAnalyserNode(node);
          }
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

      // Track call started
      trackEvent({
        eventType: "call_started",
        metadata: {
          scenarioId: scenario.id,
          scenarioName: scenario.name,
        },
      });

      // 6. Create audio capture and start streaming
      const capture = createAudioCapture((base64: string) => {
        if (sessionRef.current) {
          sessionRef.current.sendAudio(base64);
        }
      });
      captureRef.current = capture;
      await capture.start();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to start call";
      setError(message);
      setCallState("idle");
      cleanup();
    }
  }, [scenario]);

  const endCall = useCallback(() => {
    setCallState("ending");
    const finalTranscript = [...transcriptRef.current];

    trackEvent({
      eventType: "call_ended",
      metadata: {
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        durationSeconds: elapsed,
        transcriptLength: finalTranscript.length,
      },
    });

    cleanup();

    // Small delay for the "ending" animation before calling back
    setTimeout(() => {
      onCallEnd(finalTranscript);
    }, 500);
  }, [onCallEnd]);

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      {/* Prospect info bar */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {scenario.prospectName}
            </h2>
            <p className="text-sm text-gray-400">
              {scenario.prospectRole} at {scenario.prospectCompany}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              Scenario
            </p>
            <p className="text-sm text-gray-300">{scenario.name}</p>
          </div>
        </div>
      </div>

      {/* Call status center */}
      <div className="flex flex-col items-center py-6">
        {/* Pulsing call indicator */}
        <div className="relative mb-4">
          <AnimatePresence mode="wait">
            {callState === "active" && (
              <>
                <motion.div
                  key="pulse-outer"
                  className="absolute inset-0 rounded-full bg-green-500/20"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  key="pulse-mid"
                  className="absolute inset-0 rounded-full bg-green-500/30"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 0.3,
                  }}
                />
              </>
            )}
          </AnimatePresence>

          <div
            className={`relative w-20 h-20 rounded-full flex items-center justify-center ${
              callState === "active"
                ? "bg-green-500/20 border-2 border-green-500"
                : callState === "connecting"
                ? "bg-yellow-500/20 border-2 border-yellow-500"
                : callState === "ending"
                ? "bg-red-500/20 border-2 border-red-500"
                : "bg-gray-800 border-2 border-gray-700"
            }`}
          >
            {callState === "active" && (
              <PhoneCall className="w-8 h-8 text-green-500" />
            )}
            {callState === "connecting" && (
              <motion.div
                className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            )}
            {callState === "ending" && (
              <PhoneOff className="w-8 h-8 text-red-500" />
            )}
            {callState === "idle" && (
              <Phone className="w-8 h-8 text-gray-500" />
            )}
          </div>
        </div>

        {/* Status text + timer */}
        <div className="text-center mb-2">
          {callState === "idle" && (
            <p className="text-gray-400 text-sm">Ready to call</p>
          )}
          {callState === "connecting" && (
            <p className="text-yellow-400 text-sm">Connecting...</p>
          )}
          {callState === "active" && (
            <p className="text-green-400 text-sm font-medium">Call Active</p>
          )}
          {callState === "ending" && (
            <p className="text-red-400 text-sm">Ending call...</p>
          )}
        </div>

        {(callState === "active" || callState === "ending") && (
          <p className="text-3xl text-white tabular-nums" style={{ fontFamily: "var(--font-geist-mono)" }}>
            {formatTime(elapsed)}
          </p>
        )}
      </div>

      {/* Audio Visualizer */}
      <div className="mb-4 px-4">
        <AudioVisualizer
          analyserNode={analyserNode}
          isActive={callState === "active"}
        />
      </div>

      {/* Transcript */}
      <div className="flex-1 min-h-0 rounded-xl border border-gray-800 bg-gray-950 mb-4 overflow-hidden">
        <div className="h-full max-h-96 overflow-y-auto p-4 space-y-3">
          {transcript.length === 0 && callState !== "idle" && (
            <p className="text-gray-500 text-sm text-center py-8">
              Waiting for conversation to begin...
            </p>
          )}
          {transcript.length === 0 && callState === "idle" && (
            <p className="text-gray-500 text-sm text-center py-8">
              Start the call to begin your practice session
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
                    ? "bg-green-950 text-green-100 border border-green-800"
                    : "bg-gray-800 text-gray-200 border border-gray-700"
                }`}
              >
                <p className="text-xs font-medium mb-1 opacity-75">
                  {turn.role === "rep" ? "You" : scenario.prospectName}
                </p>
                <p>{turn.text}</p>
              </div>
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-center gap-3 pb-4">
        {callState === "idle" && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startCall}
            className="px-8 py-3 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20 cursor-pointer"
          >
            Start Call
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
            onClick={endCall}
            className="px-8 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 cursor-pointer"
          >
            End Call
          </motion.button>
        )}
      </div>
    </div>
  );
}
