import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  let body: {
    documentText: string;
    industry: string;
    difficulty: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const { documentText, industry, difficulty } = body;

  if (!documentText || !industry || !difficulty) {
    return NextResponse.json(
      { error: "documentText, industry, and difficulty are required" },
      { status: 400 }
    );
  }

  try {
    const client = new GoogleGenAI({ apiKey });

    const prompt = `You are a sales training scenario designer. Based on the following business document and parameters, create a realistic prospect persona for a cold call training simulation.

DOCUMENT CONTENT:
---
${documentText.slice(0, 15000)}
---

PARAMETERS:
- Industry: ${industry}
- Difficulty: ${difficulty}

Generate a realistic prospect persona that:
1. Has a name, role, and company name that fit the industry and document context
2. Has a detailed description of their situation (2-3 sentences) referencing specific details from the document
3. Has detailed behavior instructions for how they should act on a call (personality, objections, what hooks them, what turns them off) - this should be 4-6 sentences
4. Has an industry-specific hook that a good salesperson could use (1 sentence describing a specific value proposition)
5. Has an appropriate emoji icon
6. Has a scenario name (e.g., "The Skeptical CFO", "The Overwhelmed Practice Owner")

The persona should feel grounded in the real document details — reference actual products, services, challenges, or numbers from the document.

For difficulty calibration:
- Easy: Prospect is generally open to conversation, minimal objections
- Medium: Prospect has default resistance but can be won over with good technique
- Hard: Prospect is deeply skeptical, will challenge claims, requires exceptional technique

Return ONLY valid JSON with this exact structure:
{
  "scenarioName": "string",
  "prospectName": "string",
  "prospectRole": "string",
  "prospectCompany": "string",
  "description": "string",
  "prospectBehavior": "string",
  "hook": "string",
  "icon": "string (single emoji)"
}`;

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

    const persona = JSON.parse(responseText);
    return NextResponse.json(persona);
  } catch (error) {
    console.error("Persona generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate persona" },
      { status: 500 }
    );
  }
}
