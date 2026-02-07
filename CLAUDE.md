# GreenGrow Digital CCT — Cold Call Trainer

## What This App Is

An AI-powered cold call practice tool for sales reps. Reps pick a scenario, make a live voice call against an AI "prospect" that responds realistically via voice, then get a detailed scorecard showing exactly what to improve. All voice — like a real phone call.

**Built for:** GreenGrow Digital's sales team to practice cold calls without burning real prospects.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + Framer Motion |
| AI (voice calls) | Google Gemini Live API (`gemini-2.5-flash-native-audio-preview-12-2025`) via WebSocket |
| AI (scoring) | Google Gemini 2.5 Flash (REST, `@google/genai` SDK) |
| Audio capture | Web Audio API (ScriptProcessorNode, PCM 16kHz mono) |
| Audio playback | AudioContext (PCM 24kHz mono) with AnalyserNode for visualization |
| Auth | Ephemeral tokens (server-generated via `client.authTokens.create()`, short-lived) |
| Storage | localStorage for playbook, call history, scores |
| Package | `@google/genai` (v1.40+) |

**Single Google API key** powers both the Live API (voice) and REST API (scoring). Key is in `.env.local`.

## How It Works (Two Gemini Calls Per Session)

1. **Live API call (real-time voice):** Rep speaks into mic -> PCM 16kHz streamed via WebSocket to Gemini -> Gemini responds as the prospect persona with voice (PCM 24kHz) + captures transcript via inputAudioTranscription/outputAudioTranscription
2. **REST API call (scoring):** After call ends, full transcript + scenario + playbook sent to Gemini 2.5 Flash -> Returns structured JSON scorecard with 6 dimension scores

## Architecture Flow

```
Browser (Rep's mic) -> PCM 16kHz base64 -> Gemini Live API WebSocket
                                            (STT + LLM reasoning + TTS)
Browser (Speaker)  <- PCM 24kHz base64 <- Gemini Live API WebSocket

On call end: transcript -> POST /api/score -> Gemini 2.5 Flash REST -> Scorecard JSON
```

**Ephemeral token flow:** Client POSTs to `/api/token` -> Server uses GOOGLE_API_KEY to create single-use ephemeral token via `client.authTokens.create()` (v1alpha API) -> Client uses token as apiKey for Live API WebSocket connection.

## File Structure & What Each File Does

```
greengrowdigital-cct/
├── .env.local                  # GOOGLE_API_KEY (single key for everything)
├── CLAUDE.md                   # This file
├── package.json                # Next.js 16, @google/genai, framer-motion
├── tsconfig.json               # Strict TS, path alias @/* -> ./*
├── next.config.ts              # Default config
├── postcss.config.mjs          # Tailwind CSS v4 via @tailwindcss/postcss
│
├── app/
│   ├── globals.css             # Tailwind import, dark theme defaults, custom scrollbar
│   ├── layout.tsx              # Root layout (server component), Inter font, Header component
│   ├── page.tsx                # Home dashboard: stats row + ScenarioPicker grid
│   ├── call/
│   │   └── page.tsx            # Live call screen: reads ?scenario= param, renders CallInterface, on end stores transcript in sessionStorage and navigates to /scorecard
│   ├── scorecard/
│   │   └── page.tsx            # Post-call: reads sessionStorage, POSTs to /api/score, shows Scorecard component, saves to history
│   ├── playbook/
│   │   └── page.tsx            # Playbook editor: loads from localStorage, PlaybookEditor component, shows default playbook reference
│   ├── history/
│   │   └── page.tsx            # Past calls: ScoreChart + CallHistory list, clear history button
│   ├── objections/
│   │   └── page.tsx            # Objection bank reference page
│   └── api/
│       ├── token/
│       │   └── route.ts        # POST: generates ephemeral token for Live API (uses: 1, 30min expire, v1alpha)
│       └── score/
│           └── route.ts        # POST: scores transcript via Gemini 2.5 Flash REST, returns Scorecard JSON, has fallback scorecard on error
│
├── components/
│   ├── Header.tsx              # Sticky nav bar, 5 links, mobile hamburger menu, active link highlighting
│   ├── ScenarioPicker.tsx      # Responsive card grid, grouped by general/industry, difficulty badges
│   ├── CallInterface.tsx       # THE CORE: manages full call lifecycle (token fetch -> audio capture -> Gemini Live session -> transcript -> end call). States: idle/connecting/active/ending. Pulsing call indicator, timer, AudioVisualizer, chat-bubble transcript
│   ├── AudioVisualizer.tsx     # Canvas-based equalizer bars (40 bars), reads AnalyserNode frequency data, green with glow
│   ├── Scorecard.tsx           # Circular SVG progress ring for overall score, 6 dimension cards with bars + feedback + side-by-side "what you said" vs "what you should have said"
│   ├── PlaybookEditor.tsx      # Monospace textarea, save/reset buttons, character count, success toast
│   ├── CallHistory.tsx         # Sortable list with expandable rows showing dimension breakdowns
│   ├── ScoreChart.tsx          # SVG line chart of score trends over last 10 calls
│   └── ObjectionBank.tsx       # Expandable objection cards with tabbed Response A / Response B
│
├── lib/
│   ├── types.ts                # ALL shared TypeScript interfaces: Scenario, CallSession, Scorecard, DimensionScore, TranscriptTurn, GeminiLiveConfig, AudioCaptureHandle, AudioPlaybackHandle, etc.
│   ├── scenarios.ts            # 13 scenarios (6 general + 7 industry). Each has prospectName, role, company, behavior instructions for AI, difficulty, hooks
│   ├── objections.ts           # 6 objections with dual responses: "already have agency", "in-house", "tried ads", "too expensive", "send email", "not interested"
│   ├── default-playbook.ts     # Pattern Interrupt framework (6 steps): Opener, Permission Bridge, Pain Probe, Value Drop, Objection Jujitsu, Assumptive Close. Exports both structured object and rawText string
│   ├── scoring-rubric.ts       # 6 dimensions x 4 levels each (1-3, 4-6, 7-8, 9-10) with detailed descriptions
│   ├── prompts.ts              # getProspectSystemPrompt(scenario, playbook) for Live API persona + getScoringPrompt(transcript, scenario, playbook, rubric) for REST scoring. Includes difficulty-calibrated behavior instructions
│   ├── storage.ts              # localStorage CRUD: getPlaybook(), savePlaybook(), getCallHistory(), saveCall(), clearHistory(). SSR-safe with typeof window checks
│   ├── audio-capture.ts        # createAudioCapture(callback): mic -> ScriptProcessorNode -> downsample to 16kHz -> Float32->Int16 -> base64 -> callback
│   ├── audio-playback.ts       # createAudioPlayback(): enqueue(PCM ArrayBuffer) -> Int16->Float32 -> AudioBuffer -> gapless scheduled playback via AudioContext 24kHz. Has AnalyserNode for visualization
│   └── gemini-live.ts          # createGeminiLiveSession(config): connects to Gemini Live via @google/genai SDK, model gemini-2.5-flash-native-audio-preview-12-2025, Kore voice, sends/receives audio, builds transcript from inputTranscription/outputTranscription events, handles turn completion and interruptions
```

## Scoring System (6 Dimensions, 1-10 Each)

1. **Opener** — Pattern interrupt quality, first 10 seconds
2. **Tone & Confidence** — Pacing, energy, natural delivery
3. **Objection Handling** — Acknowledge + redirect technique
4. **Value Proposition** — Specific results with numbers
5. **Closing Attempt** — Assumptive close with specific times
6. **Playbook Adherence** — How well they followed the framework

Each dimension returns: score, whatWentWell, whatToImprove, exampleSaid (what rep said), shouldHaveSaid (ideal response).

## 13 Scenarios

**General (6):** Friendly Gatekeeper (Easy), Busy Decision Maker (Medium), "Send Me an Email" (Medium), Skeptical Owner (Hard), Hostile Gatekeeper (Hard), Already Has a Vendor (Hard)

**Industry-Specific (7):** Restaurant Owner "Maria", HVAC Contractor "Mike", Dental Practice "Dr. Smith", Med Spa Owner "Jessica", Real Estate Agent "Brandon", E-commerce Brand "Alex", Roofing Company "Dave"

## Design

Dark theme (`bg-gray-950`) with green accents (`#22c55e` / green-500). Professional SaaS aesthetic. Framer Motion animations throughout. Fully responsive.

## Key Implementation Details

- **Ephemeral tokens** use `v1alpha` API version, `uses: 1`, expire in 30 min, session start window 2 min
- **Live API config:** `responseModalities: [Modality.AUDIO]`, voice "Kore", `inputAudioTranscription: {}`, `outputAudioTranscription: {}`
- **Audio pipeline:** Mic capture at browser's native rate -> downsample to 16kHz -> Int16 PCM -> base64 -> `session.sendRealtimeInput()`. Receive: base64 PCM -> ArrayBuffer -> Int16 -> Float32 -> AudioBuffer at 24kHz -> gapless playback
- **Scoring:** `responseMimeType: "application/json"` for structured output. Fallback scorecard (all 5s) returned if Gemini API fails
- **Data passing between pages:** Call page stores `{transcript, scenarioId, scenarioName}` in `sessionStorage` key `cct-pending-score`, scorecard page reads it
- **localStorage keys:** `cct-playbook` (string), `cct-call-history` (JSON array of CallSession)

## Running the App

```bash
cd greengrowdigital-cct
npm run dev
# Opens on http://localhost:3000 (or next available port)
```

## Cost Per Call

- 5-min practice call: ~$0.11 (Live API audio tokens)
- Scoring: ~$0.001 (text tokens)
- 10 calls/day = ~$1.10/day per rep

## Status

**BUILD PASSING** — All files compile with zero TypeScript errors. App is fully functional and ready to use.
