// ============================================================
// GreenGrow Digital CCT — Shared Type Definitions
// ============================================================

// --- Scenarios ---

export type Difficulty = "Easy" | "Medium" | "Hard";
export type ScenarioCategory = "general" | "industry" | "custom";

export interface Scenario {
  id: string;
  name: string;
  category: ScenarioCategory;
  difficulty: Difficulty;
  industry?: string;
  prospectName: string;
  prospectRole: string;
  prospectCompany: string;
  description: string;
  prospectBehavior: string;
  hook?: string;
  icon: string; // emoji
}

// --- Objection Bank ---

export interface ObjectionEntry {
  id: string;
  objection: string;
  responseA: string;
  responseB: string;
}

// --- Playbook ---

export interface PlaybookStep {
  name: string;
  description: string;
  example: string;
}

export interface Playbook {
  title: string;
  steps: PlaybookStep[];
  rawText: string;
}

// --- Call Session ---

export interface TranscriptTurn {
  role: "rep" | "prospect";
  text: string;
  timestamp: number; // ms from call start
}

export interface CallSession {
  id: string;
  scenarioId: string;
  scenarioName: string;
  startedAt: string; // ISO date
  endedAt: string; // ISO date
  durationSeconds: number;
  transcript: TranscriptTurn[];
  scorecard?: Scorecard;
}

// --- Scoring ---

export type ScoringDimension =
  | "opener"
  | "toneConfidence"
  | "objectionHandling"
  | "valueProposition"
  | "closingAttempt"
  | "playbookAdherence";

export interface DimensionScore {
  dimension: ScoringDimension;
  label: string;
  score: number; // 1-10
  whatWentWell: string;
  whatToImprove: string;
  exampleSaid: string; // what the rep actually said
  shouldHaveSaid: string; // ideal response
}

export interface Scorecard {
  overallScore: number; // average of all dimensions
  dimensions: DimensionScore[];
  summary: string;
  topStrength: string;
  topImprovement: string;
}

// --- Scoring Rubric ---

export interface RubricLevel {
  range: [number, number]; // e.g. [1, 3]
  description: string;
}

export interface RubricDimension {
  dimension: ScoringDimension;
  label: string;
  levels: RubricLevel[];
}

// --- Storage ---

export interface StoredData {
  playbook: string; // raw text
  callHistory: CallSession[];
}

// --- Custom Scenarios ---

export interface CustomScenarioData {
  id: string;
  browser_id: string;
  name: string;
  difficulty: Difficulty;
  industry: string;
  prospect_name: string;
  prospect_role: string;
  prospect_company: string;
  description: string;
  prospect_behavior: string;
  hook: string;
  icon: string;
  document_context: string | null;
  document_name: string | null;
  category: "custom";
  created_at: string;
  updated_at: string;
}

export interface ScenarioWizardState {
  step: number;
  documentText: string;
  documentName: string;
  industry: string;
  difficulty: Difficulty;
  persona: {
    name: string;
    role: string;
    company: string;
    description: string;
    behavior: string;
    hook: string;
    icon: string;
  } | null;
  scenarioName: string;
}

export function customScenarioToScenario(
  cs: CustomScenarioData
): Scenario {
  return {
    id: `custom_${cs.id}`,
    name: cs.name,
    category: "custom",
    difficulty: cs.difficulty,
    industry: cs.industry || undefined,
    prospectName: cs.prospect_name,
    prospectRole: cs.prospect_role,
    prospectCompany: cs.prospect_company,
    description: cs.description,
    prospectBehavior: cs.prospect_behavior,
    hook: cs.hook || undefined,
    icon: cs.icon || "🎯",
  };
}

// --- API ---

export interface TokenResponse {
  token: string;
  expiresAt: string;
}

export interface ScoreRequest {
  transcript: TranscriptTurn[];
  scenarioId: string;
  scenarioName: string;
  playbookText: string;
}

export interface ScoreResponse {
  scorecard: Scorecard;
}

// --- Gemini Live ---

export interface GeminiLiveConfig {
  token: string;
  systemInstruction: string;
  onTranscriptUpdate: (turns: TranscriptTurn[]) => void;
  onAudioData: (pcmData: ArrayBuffer) => void;
  onConnectionChange: (connected: boolean) => void;
  onError: (error: string) => void;
}

// --- Audio ---

export interface AudioCaptureHandle {
  start: () => Promise<void>;
  stop: () => void;
  isActive: () => boolean;
}

export interface AudioPlaybackHandle {
  enqueue: (pcmData: ArrayBuffer) => void;
  stop: () => void;
  getAnalyserNode: () => AnalyserNode | null;
}
