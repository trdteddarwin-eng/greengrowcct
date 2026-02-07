// ============================================================
// GreenGrow Digital CCT — Audio Playback (PCM 24kHz mono -> speaker)
// ============================================================

import type { AudioPlaybackHandle } from "@/lib/types";

// ---------------------------------------------------------------------------
// Utility: Int16 PCM -> Float32 (range -1..1)
// ---------------------------------------------------------------------------
function int16ToFloat32(int16Array: Int16Array): Float32Array {
  const float32 = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32[i] = int16Array[i] / 0x8000;
  }
  return float32;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const PLAYBACK_SAMPLE_RATE = 24000;

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a PCM 24 kHz mono playback system with an AnalyserNode for
 * real-time waveform visualization.
 *
 * @returns An AudioPlaybackHandle with enqueue / stop / getAnalyserNode.
 */
export function createAudioPlayback(): AudioPlaybackHandle {
  let audioContext: AudioContext | null = null;
  let analyserNode: AnalyserNode | null = null;
  let nextStartTime = 0;
  let activeSourceNodes: AudioBufferSourceNode[] = [];

  // -----------------------------------------------------------------------
  // Lazy initialization of AudioContext + AnalyserNode.
  // We create on first enqueue so we avoid the "user gesture" restriction.
  // -----------------------------------------------------------------------
  function ensureContext(): AudioContext {
    if (!audioContext) {
      audioContext = new AudioContext({ sampleRate: PLAYBACK_SAMPLE_RATE });
      analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 2048;
      analyserNode.connect(audioContext.destination);
      nextStartTime = 0;
    }
    return audioContext;
  }

  // -----------------------------------------------------------------------
  // enqueue: accepts raw PCM Int16 data at 24 kHz mono, schedules playback
  // -----------------------------------------------------------------------
  function enqueue(pcmData: ArrayBuffer): void {
    const ctx = ensureContext();

    // Resume context if it was suspended (e.g., autoplay policy)
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {
        // Ignore resume errors
      });
    }

    // Decode Int16 -> Float32
    const int16 = new Int16Array(pcmData);
    const float32 = int16ToFloat32(int16);

    // Create an AudioBuffer with the decoded samples
    const audioBuffer = ctx.createBuffer(1, float32.length, PLAYBACK_SAMPLE_RATE);
    audioBuffer.getChannelData(0).set(float32);

    // Create a source node and connect through the analyser
    const sourceNode = ctx.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(analyserNode!);

    // Schedule gapless playback
    const now = ctx.currentTime;
    const startTime = Math.max(now, nextStartTime);
    sourceNode.start(startTime);

    // Update next start time so the following buffer begins seamlessly
    nextStartTime = startTime + audioBuffer.duration;

    // Track so we can stop all active sources later
    activeSourceNodes.push(sourceNode);

    // Clean up reference when playback finishes naturally
    sourceNode.onended = () => {
      const idx = activeSourceNodes.indexOf(sourceNode);
      if (idx !== -1) {
        activeSourceNodes.splice(idx, 1);
      }
    };
  }

  // -----------------------------------------------------------------------
  // stop: immediately halt all queued / playing audio and reset schedule
  // -----------------------------------------------------------------------
  function stop(): void {
    // Stop every active source node
    for (const node of activeSourceNodes) {
      try {
        node.stop();
        node.disconnect();
      } catch {
        // Node may already have finished — ignore
      }
    }
    activeSourceNodes = [];

    // Reset schedule so the next enqueue starts immediately
    nextStartTime = 0;
  }

  // -----------------------------------------------------------------------
  // getAnalyserNode: returns the AnalyserNode for visualization, or null
  // if no audio has been enqueued yet (context not created).
  // -----------------------------------------------------------------------
  function getAnalyserNode(): AnalyserNode | null {
    return analyserNode;
  }

  return { enqueue, stop, getAnalyserNode };
}
