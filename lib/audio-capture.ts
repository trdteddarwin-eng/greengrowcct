// ============================================================
// GreenGrow Digital CCT — Audio Capture (Mic -> PCM 16kHz mono)
// ============================================================

import type { AudioCaptureHandle } from "@/lib/types";

// ---------------------------------------------------------------------------
// Utility: Float32 -> Int16 PCM
// ---------------------------------------------------------------------------
function float32ToInt16(float32Array: Float32Array): Int16Array {
  const int16 = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16;
}

// ---------------------------------------------------------------------------
// Utility: Downsample from arbitrary source rate to target rate
// ---------------------------------------------------------------------------
function downsample(
  buffer: Float32Array,
  fromRate: number,
  toRate: number
): Float32Array {
  if (fromRate === toRate) return buffer;
  const ratio = fromRate / toRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    result[i] = buffer[Math.round(i * ratio)];
  }
  return result;
}

// ---------------------------------------------------------------------------
// Utility: ArrayBuffer -> base64 string
// ---------------------------------------------------------------------------
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// ---------------------------------------------------------------------------
// Target output sample rate
// ---------------------------------------------------------------------------
const TARGET_SAMPLE_RATE = 16000;
const BUFFER_SIZE = 4096;

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a microphone capture system that outputs base64-encoded PCM chunks
 * at 16 kHz mono. Uses ScriptProcessorNode for broad browser compatibility.
 *
 * @param onAudioData - Callback invoked with each base64-encoded PCM chunk.
 * @returns An AudioCaptureHandle with start / stop / isActive methods.
 */
export function createAudioCapture(
  onAudioData: (base64: string) => void
): AudioCaptureHandle {
  let audioContext: AudioContext | null = null;
  let mediaStream: MediaStream | null = null;
  let sourceNode: MediaStreamAudioSourceNode | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let processorNode: ScriptProcessorNode | null = null;
  let active = false;

  // -----------------------------------------------------------------------
  // start: request mic permission, wire up the processing graph
  // -----------------------------------------------------------------------
  async function start(): Promise<void> {
    if (active) return;

    // 1. Get mic stream
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // 2. Create AudioContext (browser-default sample rate)
    audioContext = new AudioContext();
    const sourceSampleRate = audioContext.sampleRate;

    // 3. Source -> ScriptProcessor -> (no destination needed, but required
    //    by the API to keep the graph alive)
    sourceNode = audioContext.createMediaStreamSource(mediaStream);

    // ScriptProcessorNode: bufferSize 4096, 1 input channel, 1 output channel
    processorNode = audioContext.createScriptProcessor(BUFFER_SIZE, 1, 1);

    processorNode.onaudioprocess = (event: AudioProcessingEvent) => {
      if (!active) return;

      // Grab mono channel
      const inputData = event.inputBuffer.getChannelData(0);

      // Downsample to 16 kHz
      const downsampled = downsample(
        inputData,
        sourceSampleRate,
        TARGET_SAMPLE_RATE
      );

      // Convert Float32 -> Int16
      const int16 = float32ToInt16(downsampled);

      // Base64-encode the raw Int16 bytes and emit
      const base64 = arrayBufferToBase64(int16.buffer as ArrayBuffer);
      onAudioData(base64);
    };

    // Wire up: source -> processor -> destination (required to keep alive)
    sourceNode.connect(processorNode);
    processorNode.connect(audioContext.destination);

    active = true;
  }

  // -----------------------------------------------------------------------
  // stop: tear down the entire graph and release the mic
  // -----------------------------------------------------------------------
  function stop(): void {
    active = false;

    if (processorNode) {
      processorNode.onaudioprocess = null;
      processorNode.disconnect();
      processorNode = null;
    }

    if (sourceNode) {
      sourceNode.disconnect();
      sourceNode = null;
    }

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      mediaStream = null;
    }

    if (audioContext) {
      audioContext.close().catch(() => {
        // Ignore close errors — context may already be closed
      });
      audioContext = null;
    }
  }

  // -----------------------------------------------------------------------
  // isActive
  // -----------------------------------------------------------------------
  function isActive(): boolean {
    return active;
  }

  return { start, stop, isActive };
}
