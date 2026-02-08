// ============================================================
// GreenGrow Digital CCT — Gemini Live API Session Manager
// ============================================================

import { GoogleGenAI, Modality } from "@google/genai";
import type { GeminiLiveConfig, TranscriptTurn } from "@/lib/types";

// ---------------------------------------------------------------------------
// Utility: base64 string -> ArrayBuffer
// ---------------------------------------------------------------------------
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// ---------------------------------------------------------------------------
// Public return type
// ---------------------------------------------------------------------------
export interface GeminiLiveSessionHandle {
  sendAudio: (base64: string) => void;
  close: () => void;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates and connects a Gemini Live session using the @google/genai SDK.
 *
 * Handles:
 * - Sending microphone audio (base64 PCM 16 kHz mono)
 * - Receiving model audio and forwarding decoded PCM to the caller
 * - Building and emitting an incrementally-updated transcript
 * - Handling turn completion and interruption signals
 *
 * @param config - Token, system prompt, and callback hooks.
 * @returns A handle with `sendAudio` and `close` methods.
 */
export async function createGeminiLiveSession(
  config: GeminiLiveConfig
): Promise<GeminiLiveSessionHandle> {
  const { token, systemInstruction, voiceName, onTranscriptUpdate, onAudioData, onConnectionChange, onError } =
    config;

  // Internal transcript state
  const transcript: TranscriptTurn[] = [];
  const sessionStartTime = Date.now();

  // Track whether we are currently accumulating text for each role so we
  // can append to the most recent turn rather than creating duplicates.
  let currentRepTurn: TranscriptTurn | null = null;
  let currentProspectTurn: TranscriptTurn | null = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let session: any = null;

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  function elapsed(): number {
    return Date.now() - sessionStartTime;
  }

  function emitTranscript(): void {
    // Emit a shallow copy so consumers can't mutate our internal array
    onTranscriptUpdate([...transcript]);
  }

  function handleInputTranscription(text: string): void {
    if (!text) return;

    if (currentRepTurn) {
      // Append to existing rep turn
      currentRepTurn.text += text;
    } else {
      // Start a new rep turn
      currentRepTurn = { role: "rep", text, timestamp: elapsed() };
      transcript.push(currentRepTurn);
    }

    emitTranscript();
  }

  function handleOutputTranscription(text: string): void {
    if (!text) return;

    if (currentProspectTurn) {
      // Append to existing prospect turn
      currentProspectTurn.text += text;
    } else {
      // Start a new prospect turn
      currentProspectTurn = { role: "prospect", text, timestamp: elapsed() };
      transcript.push(currentProspectTurn);
    }

    emitTranscript();
  }

  // -----------------------------------------------------------------------
  // Connect to Gemini Live
  // -----------------------------------------------------------------------

  try {
    const ai = new GoogleGenAI({ apiKey: token, apiVersion: "v1alpha" });

    session = await ai.live.connect({
      model: "gemini-2.5-flash-native-audio-preview-12-2025",
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction,
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || "Kore" },
          },
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
      callbacks: {
        // ----- Connection opened -----
        onopen: () => {
          onConnectionChange(true);
        },

        // ----- Incoming message -----
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onmessage: (message: any) => {
          const serverContent = message?.serverContent;
          if (!serverContent) return;

          // --- Audio data from model ---
          const parts = serverContent.modelTurn?.parts;
          if (parts && Array.isArray(parts)) {
            for (const part of parts) {
              const b64 = part?.inlineData?.data;
              if (b64) {
                const pcmBuffer = base64ToArrayBuffer(b64);
                onAudioData(pcmBuffer);
              }
            }
          }

          // --- Turn complete: finalize current turns ---
          if (serverContent.turnComplete === true) {
            // Reset accumulation so the next transcription starts a new turn
            currentRepTurn = null;
            currentProspectTurn = null;
          }

          // --- Interrupted: signal and reset prospect turn ---
          if (serverContent.interrupted === true) {
            currentProspectTurn = null;
          }

          // --- Output transcription (prospect / model) ---
          const outputText = serverContent.outputTranscription?.text;
          if (outputText) {
            handleOutputTranscription(outputText);
          }

          // --- Input transcription (rep / user) ---
          const inputText = serverContent.inputTranscription?.text;
          if (inputText) {
            handleInputTranscription(inputText);
          }
        },

        // ----- Error -----
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onerror: (e: any) => {
          // Extract a meaningful error message. The SDK may pass an Error,
          // a string, an ErrorEvent (has .message), or a bare Event
          // (only {isTrusted:true}) which carries no useful info.
          const errorMessage =
            e instanceof Error
              ? e.message
              : typeof e === "string"
              ? e
              : typeof e?.message === "string" && e.message.length > 0
              ? e.message
              : e?.error?.message ?? null;

          // Ignore bare Event objects that carry no error info (e.g. normal close)
          if (!errorMessage) return;

          console.error("Gemini Live onerror:", e);
          onError(errorMessage);
        },

        // ----- Connection closed -----
        onclose: () => {
          onConnectionChange(false);
        },
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to connect to Gemini Live";
    onError(msg);
    onConnectionChange(false);

    // Return a no-op handle so the caller doesn't crash
    return {
      sendAudio: () => {},
      close: () => {},
    };
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  function sendAudio(base64: string): void {
    if (!session) return;
    try {
      session.sendRealtimeInput({
        audio: {
          data: base64,
          mimeType: "audio/pcm;rate=16000",
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send audio";
      onError(msg);
    }
  }

  function close(): void {
    if (!session) return;
    try {
      session.close();
    } catch {
      // Ignore close errors — connection may already be terminated
    }
    session = null;
    onConnectionChange(false);
  }

  return { sendAudio, close };
}
