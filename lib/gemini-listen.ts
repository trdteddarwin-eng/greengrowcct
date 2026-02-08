// ============================================================
// GreenGrow Digital CCT — Gemini Live Listen-Only Session
// ============================================================
//
// Simplified variant of gemini-live.ts for the Live Call Assistant.
// Creates a Gemini Live session in listen-only mode:
// - No voice output (TEXT modality only)
// - Captures rep's speech via inputAudioTranscription
// - System instruction tells model to be silent
// ============================================================

import { GoogleGenAI, Modality } from "@google/genai";
import type { GeminiListenConfig, TranscriptTurn } from "@/lib/types";

// ---------------------------------------------------------------------------
// Public return type
// ---------------------------------------------------------------------------
export interface GeminiListenSessionHandle {
  sendAudio: (base64: string) => void;
  close: () => void;
  getTranscript: () => TranscriptTurn[];
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export async function createGeminiListenSession(
  config: GeminiListenConfig
): Promise<GeminiListenSessionHandle> {
  const { token, onTranscriptUpdate, onConnectionChange, onError } = config;

  const transcript: TranscriptTurn[] = [];
  const sessionStartTime = Date.now();

  let currentRepTurn: TranscriptTurn | null = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let session: any = null;

  function elapsed(): number {
    return Date.now() - sessionStartTime;
  }

  function emitTranscript(): void {
    onTranscriptUpdate([...transcript]);
  }

  function handleInputTranscription(text: string): void {
    if (!text) return;

    if (currentRepTurn) {
      currentRepTurn.text += text;
    } else {
      currentRepTurn = { role: "rep", text, timestamp: elapsed() };
      transcript.push(currentRepTurn);
    }

    emitTranscript();
  }

  try {
    const ai = new GoogleGenAI({ apiKey: token, apiVersion: "v1alpha" });

    session = await ai.live.connect({
      model: "gemini-2.5-flash-native-audio-preview-12-2025",
      config: {
        responseModalities: [Modality.TEXT],
        systemInstruction:
          "You are a silent listener. Do not speak. Do not respond. Just listen to the audio and transcribe it. Never generate any text output.",
        inputAudioTranscription: {},
      },
      callbacks: {
        onopen: () => {
          onConnectionChange(true);
        },

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onmessage: (message: any) => {
          const serverContent = message?.serverContent;
          if (!serverContent) return;

          // Turn complete — finalize current turn
          if (serverContent.turnComplete === true) {
            currentRepTurn = null;
          }

          // Input transcription (rep's speech from mic)
          const inputText = serverContent.inputTranscription?.text;
          if (inputText) {
            handleInputTranscription(inputText);
          }
        },

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onerror: (e: any) => {
          const errorMessage =
            e instanceof Error
              ? e.message
              : typeof e === "string"
              ? e
              : typeof e?.message === "string" && e.message.length > 0
              ? e.message
              : e?.error?.message ?? null;

          if (!errorMessage) return;

          console.error("Gemini Listen onerror:", e);
          onError(errorMessage);
        },

        onclose: () => {
          onConnectionChange(false);
        },
      },
    });
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : "Failed to connect to Gemini Live (listen mode)";
    onError(msg);
    onConnectionChange(false);

    return {
      sendAudio: () => {},
      close: () => {},
      getTranscript: () => [...transcript],
    };
  }

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
      // Ignore close errors
    }
    session = null;
    onConnectionChange(false);
  }

  function getTranscript(): TranscriptTurn[] {
    return [...transcript];
  }

  return { sendAudio, close, getTranscript };
}
