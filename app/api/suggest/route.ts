import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { getCoachingPrompt } from "@/lib/prompts";
import type { LiveSuggestion } from "@/lib/types";

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.error("GOOGLE_API_KEY is not set in environment variables");
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  let body: { transcript?: string; playbookText?: string; businessContext?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const { transcript, playbookText, businessContext } = body;

  if (!transcript || typeof transcript !== "string") {
    return NextResponse.json(
      { error: "transcript is required" },
      { status: 400 }
    );
  }

  if (!playbookText || typeof playbookText !== "string") {
    return NextResponse.json(
      { error: "playbookText is required" },
      { status: 400 }
    );
  }

  try {
    const prompt = getCoachingPrompt(transcript, playbookText, businessContext);

    const client = new GoogleGenAI({ apiKey });

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text;

    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    let parsed: LiveSuggestion;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      console.error("Failed to parse Gemini response as JSON:", responseText);
      throw new Error("Gemini returned invalid JSON");
    }

    return NextResponse.json({ suggestions: parsed });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to generate suggestions";
    console.error("Suggest error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
