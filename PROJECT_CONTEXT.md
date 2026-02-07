# GreenGrow Digital CCT — Complete Project Context

## What This App Is

An AI-powered cold call training tool. Sales reps pick a scenario (or create their own), make a live voice call against an AI "prospect" that responds realistically via voice, then get a detailed scorecard. All voice — like a real phone call.

**Built for:** GreenGrow Digital's sales team to practice cold calls without burning real prospects.

**Repo:** `https://github.com/trdteddarwin-eng/greengrowcct.git`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + Framer Motion |
| AI (voice calls) | Google Gemini Live API (`gemini-2.5-flash-native-audio-preview-12-2025`) via WebSocket |
| AI (scoring) | Google Gemini 2.5 Flash (REST, `@google/genai` SDK) |
| AI (persona generation) | Google Gemini 2.5 Flash (REST, structured JSON output) |
| Audio capture | Web Audio API (ScriptProcessorNode, PCM 16kHz mono) |
| Audio playback | AudioContext (PCM 24kHz mono) with AnalyserNode for visualization |
| Auth | Ephemeral tokens (server-generated via `client.authTokens.create()`, short-lived) |
| Storage (local) | localStorage for playbook, call history, scores, browser ID |
| Storage (cloud) | Supabase (custom scenarios + document text) |
| Doc parsing | pdf-parse (PDF), mammoth (DOCX), native (TXT) |
| Package manager | npm |

**Two API keys needed:**
1. `GOOGLE_API_KEY` — powers Gemini Live (voice), REST (scoring), and persona generation
2. `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase for custom scenarios

---

## How It Works

### Core Flow (Two Gemini Calls Per Session)
1. **Live API call (real-time voice):** Rep speaks into mic -> PCM 16kHz streamed via WebSocket to Gemini -> Gemini responds as the prospect persona with voice (PCM 24kHz) + captures transcript
2. **REST API call (scoring):** After call ends, full transcript + scenario + playbook sent to Gemini 2.5 Flash -> Returns structured JSON scorecard with 6 dimension scores

### Custom Scenario Flow (New Feature)
1. User uploads a business document (PDF/DOCX/TXT) or pastes text
2. Text extracted via `/api/extract-text` (server-side, pdf-parse/mammoth)
3. User picks industry + difficulty
4. AI generates a prospect persona via `/api/generate-persona` (Gemini 2.5 Flash)
5. User can edit all persona fields
6. Scenario saved to Supabase via `/api/scenarios`
7. During calls, document text injected into Gemini Live system prompt as "BUSINESS CONTEXT"
8. AI prospect naturally references document details in conversation

---

## Architecture

```
Browser (Rep's mic) -> PCM 16kHz base64 -> Gemini Live API WebSocket
                                            (STT + LLM reasoning + TTS)
Browser (Speaker)  <- PCM 24kHz base64 <- Gemini Live API WebSocket

On call end: transcript -> POST /api/score -> Gemini 2.5 Flash REST -> Scorecard JSON

Custom scenarios: Upload doc -> /api/extract-text -> /api/generate-persona -> /api/scenarios -> Supabase
                  On call: Supabase fetch -> document context injected into system prompt
```

**Ephemeral token flow:** Client POSTs to `/api/token` -> Server uses GOOGLE_API_KEY to create single-use ephemeral token via `client.authTokens.create()` (v1alpha API) -> Client uses token for Live API WebSocket.

**Scenario resolution:** When a call starts, `resolveScenario(id)` checks hardcoded scenarios first, then fetches custom scenarios from Supabase (identified by `custom_` prefix on ID).

---

## Complete File Structure

```
greengrowdigital-cct/
├── .env.local                          # GOOGLE_API_KEY + SUPABASE env vars (not in git)
├── .gitignore                          # node_modules, .next, .env.local
├── CLAUDE.md                           # App-specific Claude instructions
├── PROJECT_CONTEXT.md                  # This file — complete project context
├── package.json                        # Next.js 16, @google/genai, framer-motion, @supabase/supabase-js, pdf-parse, mammoth
├── tsconfig.json                       # Strict TS, path alias @/* -> ./*
├── next.config.ts                      # Default config
├── postcss.config.mjs                  # Tailwind CSS v4
│
├── app/
│   ├── globals.css                     # Tailwind import, dark theme, custom scrollbar
│   ├── layout.tsx                      # Root layout (server component), Inter font, Header
│   ├── page.tsx                        # Home: stats + ScenarioPicker (fetches custom scenarios from Supabase)
│   │
│   ├── call/
│   │   └── page.tsx                    # Live call: async scenario resolution (hardcoded OR custom), CallInterface
│   ├── scorecard/
│   │   └── page.tsx                    # Post-call scoring display
│   ├── playbook/
│   │   └── page.tsx                    # Playbook editor
│   ├── history/
│   │   └── page.tsx                    # Past calls list + chart
│   ├── objections/
│   │   └── page.tsx                    # Objection bank reference
│   │
│   ├── scenarios/                      # NEW — Custom scenarios feature
│   │   ├── page.tsx                    # Custom scenarios management (list/delete grid)
│   │   └── create/
│   │       └── page.tsx                # 4-step wizard page
│   │
│   └── api/
│       ├── token/
│       │   └── route.ts                # POST: ephemeral token for Live API
│       ├── score/
│       │   └── route.ts                # POST: score transcript (supports custom scenarios via resolveScenario)
│       ├── extract-text/               # NEW
│       │   └── route.ts                # POST: PDF/DOCX/TXT -> plaintext (15K char limit)
│       ├── generate-persona/           # NEW
│       │   └── route.ts                # POST: document + industry + difficulty -> structured persona JSON
│       └── scenarios/                  # NEW
│           ├── route.ts                # GET (list by browser_id) + POST (create)
│           └── [id]/
│               └── route.ts            # GET + PUT + DELETE
│
├── components/
│   ├── Header.tsx                      # Sticky nav: Home, Practice, Scenarios, Playbook, Objections, History
│   ├── ScenarioPicker.tsx              # Card grid: Custom Scenarios section + General + Industry
│   ├── CallInterface.tsx               # Core call UI: accepts documentContext prop, passes to prompt
│   ├── AudioVisualizer.tsx             # Canvas equalizer bars
│   ├── Scorecard.tsx                   # Score display with dimension cards
│   ├── PlaybookEditor.tsx              # Textarea editor
│   ├── CallHistory.tsx                 # Expandable call list
│   ├── ScoreChart.tsx                  # SVG line chart
│   ├── ObjectionBank.tsx               # Tabbed objection cards
│   │
│   ├── ScenarioWizard.tsx              # NEW — 4-step wizard orchestrator
│   └── wizard/                         # NEW — Wizard step components
│       ├── DocumentUpload.tsx           # Step 1: Drag-drop file upload + text paste
│       ├── ScenarioConfig.tsx           # Step 2: Industry dropdown + difficulty radio buttons
│       ├── PersonaEditor.tsx            # Step 3: AI-generated editable persona form
│       └── ScenarioSummary.tsx          # Step 4: Review card before save
│
├── lib/
│   ├── types.ts                        # All shared types: Scenario, CustomScenarioData, ScenarioWizardState, customScenarioToScenario()
│   ├── scenarios.ts                    # 13 hardcoded scenarios (6 general + 7 industry)
│   ├── prompts.ts                      # getProspectSystemPrompt(scenario, playbook, documentContext?) + getScoringPrompt()
│   ├── storage.ts                      # localStorage CRUD + getBrowserId()
│   ├── supabase.ts                     # NEW — Supabase client factory
│   ├── scenario-resolver.ts            # NEW — Unified lookup: hardcoded array OR Supabase by custom_ prefix
│   ├── objections.ts                   # 6 objections with dual responses
│   ├── default-playbook.ts             # Pattern Interrupt framework (6 steps)
│   ├── scoring-rubric.ts               # 6 dimensions x 4 levels
│   ├── audio-capture.ts                # Mic -> 16kHz PCM -> base64
│   ├── audio-playback.ts               # PCM 24kHz -> gapless playback
│   └── gemini-live.ts                  # WebSocket session with Gemini Live API
```

---

## Supabase Schema

**Table: `custom_scenarios`**

```sql
create table custom_scenarios (
  id uuid default gen_random_uuid() primary key,
  browser_id text not null,
  name text not null,
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  industry text not null default '',
  prospect_name text not null,
  prospect_role text not null,
  prospect_company text not null,
  description text not null,
  prospect_behavior text not null,
  hook text not null default '',
  icon text not null default '',
  document_context text,
  document_name text,
  category text not null default 'custom',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_custom_scenarios_browser_id on custom_scenarios(browser_id);
```

**No auth yet** — uses `browser_id` (random UUID in localStorage) to scope data per browser. Upgradeable to Supabase Auth later.

---

## 13 Hardcoded Scenarios

**General (6):** Friendly Gatekeeper (Easy), Busy Decision Maker (Medium), "Send Me an Email" (Medium), Skeptical Owner (Hard), Hostile Gatekeeper (Hard), Already Has a Vendor (Hard)

**Industry-Specific (7):** Restaurant Owner "Maria", HVAC Contractor "Mike", Dental Practice "Dr. Smith", Med Spa Owner "Jessica", Real Estate Agent "Brandon", E-commerce Brand "Alex", Roofing Company "Dave"

---

## Scoring System (6 Dimensions, 1-10 Each)

1. **Opener** — Pattern interrupt quality, first 10 seconds
2. **Tone & Confidence** — Pacing, energy, natural delivery
3. **Objection Handling** — Acknowledge + redirect technique
4. **Value Proposition** — Specific results with numbers
5. **Closing Attempt** — Assumptive close with specific times
6. **Playbook Adherence** — How well they followed the framework

Each dimension returns: score, whatWentWell, whatToImprove, exampleSaid, shouldHaveSaid.

---

## Key Design Decisions

1. **Custom scenario IDs use `custom_` prefix** — enables unified resolution via `resolveScenario()`. Hardcoded IDs like `"friendly-gatekeeper"` never start with `custom_`.
2. **Document text stored directly on scenario row** (no separate documents table) — simpler, no joins needed.
3. **15K char limit** on document text — fits in Gemini's 1M token context alongside existing prompt.
4. **Browser ID for scoping** — `crypto.randomUUID()` stored in localStorage under key `cct-browser-id`. No auth required yet.
5. **Supabase client shared between server and client** — `NEXT_PUBLIC_` env vars make it available in both contexts.
6. **AI persona generation** uses `responseMimeType: "application/json"` for structured output (same pattern as scoring).
7. **Document context injected as "BUSINESS CONTEXT" section** in the Gemini Live system prompt, between industry context and scenario context.

---

## Environment Variables (.env.local)

```
GOOGLE_API_KEY=<your-google-api-key>
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

---

## Running the App

```bash
git clone https://github.com/trdteddarwin-eng/greengrowcct.git
cd greengrowcct
npm install
# Create .env.local with the 3 env vars above
# Create Supabase table using the SQL schema above
npm run dev
```

---

## Cost Per Call

- 5-min practice call: ~$0.11 (Live API audio tokens)
- Scoring: ~$0.001 (text tokens)
- Persona generation: ~$0.001 (text tokens)
- 10 calls/day = ~$1.10/day per rep

---

## Design

Dark theme (`bg-gray-950`) with green accents (`#22c55e` / green-500). Professional SaaS aesthetic. Framer Motion animations throughout. Fully responsive. Blue accent dot for custom scenarios section to differentiate from green dot for general/industry.

---

## Build Status

**TypeScript: ZERO ERRORS** (`npx tsc --noEmit` passes clean)

All 22 files verified:
- 13 new files created
- 9 existing files modified
- No breaking changes to existing functionality
