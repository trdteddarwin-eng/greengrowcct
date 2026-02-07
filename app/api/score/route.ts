import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { scenarios } from "@/lib/scenarios";
import { getScoringPrompt } from "@/lib/prompts";
import { scoringRubric } from "@/lib/scoring-rubric";
import { resolveScenario } from "@/lib/scenario-resolver";
import type {
  ScoreRequest,
  ScoreResponse,
  Scorecard,
  DimensionScore,
  ScoringDimension,
} from "@/lib/types";

const ALL_DIMENSIONS: ScoringDimension[] = [
  "opener",
  "toneConfidence",
  "objectionHandling",
  "valueProposition",
  "closingAttempt",
  "playbookAdherence",
];

const DIMENSION_LABELS: Record<ScoringDimension, string> = {
  opener: "Opener",
  toneConfidence: "Tone & Confidence",
  objectionHandling: "Objection Handling",
  valueProposition: "Value Proposition",
  closingAttempt: "Closing Attempt",
  playbookAdherence: "Playbook Adherence",
};

function buildFallbackScorecard(errorMessage: string): Scorecard {
  const dimensions: DimensionScore[] = ALL_DIMENSIONS.map((dimension) => ({
    dimension,
    label: DIMENSION_LABELS[dimension],
    score: 5,
    whatWentWell: "Unable to evaluate — scoring failed.",
    whatToImprove: "Unable to evaluate — scoring failed.",
    exampleSaid: "",
    shouldHaveSaid: "",
  }));

  return {
    overallScore: 5,
    dimensions,
    summary: `Scoring could not be completed: ${errorMessage}. Default scores have been assigned. Please try again.`,
    topStrength: "Unable to determine",
    topImprovement: "Unable to determine",
  };
}

function validateAndNormalizeScorecard(raw: Record<string, unknown>): Scorecard {
  const rawDimensions = raw.dimensions;
  if (!Array.isArray(rawDimensions)) {
    throw new Error("Response missing 'dimensions' array");
  }

  const parsedDimensions: DimensionScore[] = [];
  const seenDimensions = new Set<ScoringDimension>();

  for (const dim of rawDimensions) {
    if (!dim || typeof dim !== "object") continue;

    const d = dim as Record<string, unknown>;
    const dimension = d.dimension as ScoringDimension;

    if (!ALL_DIMENSIONS.includes(dimension)) continue;
    if (seenDimensions.has(dimension)) continue;

    seenDimensions.add(dimension);

    const score = Math.max(1, Math.min(10, Math.round(Number(d.score) || 5)));

    parsedDimensions.push({
      dimension,
      label: typeof d.label === "string" ? d.label : DIMENSION_LABELS[dimension],
      score,
      whatWentWell: typeof d.whatWentWell === "string" ? d.whatWentWell : "",
      whatToImprove: typeof d.whatToImprove === "string" ? d.whatToImprove : "",
      exampleSaid: typeof d.exampleSaid === "string" ? d.exampleSaid : "",
      shouldHaveSaid: typeof d.shouldHaveSaid === "string" ? d.shouldHaveSaid : "",
    });
  }

  // Fill in any missing dimensions with defaults
  for (const dimension of ALL_DIMENSIONS) {
    if (!seenDimensions.has(dimension)) {
      parsedDimensions.push({
        dimension,
        label: DIMENSION_LABELS[dimension],
        score: 5,
        whatWentWell: "Not evaluated",
        whatToImprove: "Not evaluated",
        exampleSaid: "",
        shouldHaveSaid: "",
      });
    }
  }

  // Sort dimensions to match the canonical order
  parsedDimensions.sort(
    (a, b) => ALL_DIMENSIONS.indexOf(a.dimension) - ALL_DIMENSIONS.indexOf(b.dimension)
  );

  const overallScore =
    Math.round(
      (parsedDimensions.reduce((sum, d) => sum + d.score, 0) /
        parsedDimensions.length) *
        10
    ) / 10;

  return {
    overallScore,
    dimensions: parsedDimensions,
    summary: typeof raw.summary === "string" ? raw.summary : "",
    topStrength: typeof raw.topStrength === "string" ? raw.topStrength : "",
    topImprovement: typeof raw.topImprovement === "string" ? raw.topImprovement : "",
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.error("GOOGLE_API_KEY is not set in environment variables");
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  let body: ScoreRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const { transcript, scenarioId, scenarioName, playbookText } = body;

  if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
    return NextResponse.json(
      { error: "Transcript is required and must be a non-empty array" },
      { status: 400 }
    );
  }

  if (!scenarioId || typeof scenarioId !== "string") {
    return NextResponse.json(
      { error: "scenarioId is required" },
      { status: 400 }
    );
  }

  // Look up the scenario (supports both hardcoded and custom scenarios)
  const resolved = await resolveScenario(scenarioId);

  const resolvedScenario: import("@/lib/types").Scenario = resolved?.scenario ?? {
    id: scenarioId,
    name: scenarioName || "Unknown Scenario",
    category: "general",
    difficulty: "Medium",
    prospectName: "Unknown",
    prospectRole: "Unknown",
    prospectCompany: "Unknown",
    description: "",
    prospectBehavior: "",
    icon: "📞",
  };

  try {
    const scoringPromptText = getScoringPrompt(
      transcript,
      resolvedScenario,
      playbookText || "",
      scoringRubric,
    );

    const client = new GoogleGenAI({ apiKey });

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: scoringPromptText,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text;

    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      console.error("Failed to parse Gemini response as JSON:", responseText);
      throw new Error("Gemini returned invalid JSON");
    }

    const scorecard = validateAndNormalizeScorecard(parsed);

    const scoreResponse: ScoreResponse = { scorecard };
    return NextResponse.json(scoreResponse);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to score transcript";
    console.error("Scoring error:", message);

    // Return fallback scorecard instead of a hard error so the UI can still show results
    const fallbackScorecard = buildFallbackScorecard(message);
    const scoreResponse: ScoreResponse = { scorecard: fallbackScorecard };

    return NextResponse.json(scoreResponse);
  }
}
