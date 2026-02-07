"use client";

import { useRef, useEffect } from "react";

interface AudioVisualizerProps {
  analyserNode: AnalyserNode | null;
  isActive: boolean;
}

const BAR_COUNT = 40;
const BAR_COLOR = "#22c55e";
const BAR_GLOW_COLOR = "rgba(34, 197, 94, 0.3)";
const BAR_GAP = 2;
const MIN_BAR_HEIGHT = 2;

export default function AudioVisualizer({
  analyserNode,
  isActive,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set up data array if we have an analyser
    if (analyserNode) {
      dataArrayRef.current = new Uint8Array(analyserNode.frequencyBinCount);
    }

    function draw() {
      if (!canvas || !ctx) return;

      const { width, height } = canvas;
      const dpr = window.devicePixelRatio || 1;

      // Handle HiDPI
      if (canvas.width !== canvas.clientWidth * dpr) {
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        ctx.scale(dpr, dpr);
      }

      const drawWidth = canvas.clientWidth;
      const drawHeight = canvas.clientHeight;

      // Clear
      ctx.clearRect(0, 0, drawWidth, drawHeight);

      const barWidth = (drawWidth - BAR_GAP * (BAR_COUNT - 1)) / BAR_COUNT;
      const centerY = drawHeight / 2;

      if (isActive && analyserNode && dataArrayRef.current) {
        analyserNode.getByteFrequencyData(dataArrayRef.current);
        const data = dataArrayRef.current;

        // Map frequency data to our bar count
        const step = Math.floor(data.length / BAR_COUNT);

        // Set up glow effect
        ctx.shadowColor = BAR_GLOW_COLOR;
        ctx.shadowBlur = 8;

        for (let i = 0; i < BAR_COUNT; i++) {
          // Average a range of frequency bins for this bar
          let sum = 0;
          for (let j = 0; j < step; j++) {
            sum += data[i * step + j];
          }
          const avg = sum / step;

          // Normalize to height (0-255 -> 0-maxBarHeight)
          const maxBarHeight = drawHeight * 0.45;
          const barHeight = Math.max(
            MIN_BAR_HEIGHT,
            (avg / 255) * maxBarHeight
          );

          const x = i * (barWidth + BAR_GAP);

          // Draw bar (mirrored from center)
          ctx.fillStyle = BAR_COLOR;
          ctx.beginPath();
          ctx.roundRect(x, centerY - barHeight, barWidth, barHeight * 2, 1);
          ctx.fill();
        }

        // Reset glow
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      } else {
        // Idle state: show minimal flat bars
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;

        for (let i = 0; i < BAR_COUNT; i++) {
          const x = i * (barWidth + BAR_GAP);
          const idleHeight = MIN_BAR_HEIGHT + Math.sin(i * 0.3) * 1;

          ctx.fillStyle = "rgba(34, 197, 94, 0.2)";
          ctx.beginPath();
          ctx.roundRect(x, centerY - idleHeight, barWidth, idleHeight * 2, 1);
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    }

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyserNode, isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-24 rounded-lg"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
