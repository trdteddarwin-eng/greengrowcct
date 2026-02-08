import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { getResearchPrompt } from "@/lib/prompts";
import type { ResearchResult } from "@/lib/types";

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.error("GOOGLE_API_KEY is not set in environment variables");
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  let body: { websiteText?: string; url?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const { websiteText, url } = body;

  if (!websiteText || typeof websiteText !== "string") {
    return NextResponse.json(
      { error: "websiteText is required" },
      { status: 400 }
    );
  }

  if (!url || typeof url !== "string") {
    return NextResponse.json(
      { error: "url is required" },
      { status: 400 }
    );
  }

  try {
    const prompt = getResearchPrompt(websiteText, url);

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

    let parsed: ResearchResult;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      console.error("Failed to parse Gemini response as JSON:", responseText);
      throw new Error("Gemini returned invalid JSON");
    }

    return NextResponse.json({ research: parsed });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to analyze website";
    console.error("Research error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
