// ============================================================
// GreenGrow Digital CCT — Scoring Rubric
// ============================================================

import type { RubricDimension } from "@/lib/types";

export const scoringRubric: RubricDimension[] = [
  {
    dimension: "opener",
    label: "Opener & Pattern Interrupt",
    levels: [
      {
        range: [1, 3],
        description:
          "Generic or scripted opener with no pattern interrupt. Used a standard 'Hi, my name is X from Y' introduction. Did not acknowledge the cold call, did not use the prospect's name or company, and failed to create any curiosity or reason to stay on the line. Prospect likely tuned out within the first 5 seconds.",
      },
      {
        range: [4, 6],
        description:
          "Attempted a pattern interrupt but execution was weak. May have acknowledged the cold call or used the prospect's name, but the delivery felt rehearsed or lacked energy. The hook was vague or generic ('I help businesses grow'). Prospect didn't hang up but wasn't engaged either — gave a lukewarm response.",
      },
      {
        range: [7, 8],
        description:
          "Solid pattern interrupt that broke the prospect's autopilot. Acknowledged the cold call naturally, used the prospect's name and company, and delivered a micro-hook that created curiosity. Asked for a small time commitment. Prospect paused and engaged rather than defaulting to 'not interested.' Minor room for improvement in energy or specificity.",
      },
      {
        range: [9, 10],
        description:
          "Masterful pattern interrupt that immediately set a different tone. Felt completely natural and unscripted. Combined self-awareness, humor, and a sharp company-specific hook that made the prospect genuinely curious. The prospect leaned in and wanted to hear more. Perfectly calibrated energy and pacing for the scenario.",
      },
    ],
  },
  {
    dimension: "toneConfidence",
    label: "Tone & Confidence",
    levels: [
      {
        range: [1, 3],
        description:
          "Sounded nervous, uncertain, or overly apologetic throughout the call. Used filler words excessively ('um,' 'uh,' 'like'). Voice lacked conviction — sounded like they were reading from a script or asking permission to exist. Pace was too fast (nervous) or too slow (unsure). The prospect could sense the lack of confidence and it undermined credibility.",
      },
      {
        range: [4, 6],
        description:
          "Adequate confidence but inconsistent. Started reasonably strong but wavered when facing pushback or silence. Some filler words and occasional uncertainty in voice. Tone was generally professional but lacked the warmth and authority of a seasoned caller. Recovered from some awkward moments but others derailed the flow.",
      },
      {
        range: [7, 8],
        description:
          "Confident and professional throughout most of the call. Voice conveyed authority without being aggressive. Good pace and energy — matched the prospect's communication style. Handled pushback without getting flustered. Minor moments of hesitation or slightly robotic delivery, but overall projected competence and trustworthiness.",
      },
      {
        range: [9, 10],
        description:
          "Exceptional presence and vocal command. Sounded like a peer having a business conversation, not a salesperson reading a pitch. Perfectly calibrated tone — warm, confident, and conversational. Adapted energy level to match the prospect (high energy for enthusiastic prospects, calm authority for skeptics). Zero filler words. Pauses were strategic, not nervous. Completely unflappable under pressure.",
      },
    ],
  },
  {
    dimension: "objectionHandling",
    label: "Objection Handling",
    levels: [
      {
        range: [1, 3],
        description:
          "Failed to handle objections effectively. Either ignored objections entirely, argued with the prospect, got defensive, or froze when challenged. Used 'I understand, BUT...' which negated the validation. No reframing — just repeated the pitch louder or gave up. Made the prospect feel unheard or disrespected.",
      },
      {
        range: [4, 6],
        description:
          "Acknowledged objections but responses were generic or scripted. Attempted the Agree-Ask-Advance framework but execution was rough — validation felt superficial, questions were too broad, and the advance was pushy. Handled one objection decently but struggled when the prospect stacked multiple objections or escalated resistance.",
      },
      {
        range: [7, 8],
        description:
          "Handled objections smoothly using the Agree-Ask-Advance framework. Validated the prospect's concern genuinely, asked a smart reframing question that shifted the conversation, and offered a low-commitment next step. Maintained composure under pressure. Handled most objections well, though one response could have been sharper or more tailored to the specific prospect.",
      },
      {
        range: [9, 10],
        description:
          "Elite objection handling — turned every pushback into a deeper conversation. Validation felt completely genuine and earned the prospect's trust. Reframing questions were so sharp they made the prospect reconsider their own position. Seamlessly transitioned from objection to value without feeling manipulative. Handled stacked objections with ease. The prospect felt heard, respected, and intrigued rather than sold to.",
      },
    ],
  },
  {
    dimension: "valueProposition",
    label: "Value Proposition & Specificity",
    levels: [
      {
        range: [1, 3],
        description:
          "Value proposition was vague, generic, or missing entirely. Used empty phrases like 'we help businesses grow' or 'we get you more customers' without any specifics. No numbers, no case studies, no concrete examples. Could have been selling anything to anyone. Prospect had no reason to believe this was different from the last 10 sales calls they received.",
      },
      {
        range: [4, 6],
        description:
          "Attempted to deliver value but lacked specificity. Mentioned general results ('our clients see great ROI') without concrete numbers. May have referenced a case study but it was vague or not relevant to the prospect's industry. The value drop didn't connect to the prospect's specific pain point from the conversation. Prospect was somewhat interested but not compelled.",
      },
      {
        range: [7, 8],
        description:
          "Delivered a strong value proposition with specific numbers and a relevant case study. Connected the value directly to the prospect's stated pain point. Used concrete metrics (cost per lead, ROAS, percentage improvements). Referenced a similar business in the same or adjacent industry. The prospect could see themselves in the success story. Minor missed opportunities to personalize further.",
      },
      {
        range: [9, 10],
        description:
          "Exceptional value delivery that felt like a custom consultation, not a sales pitch. Every data point was chosen specifically for this prospect and their stated problems. Wove industry-specific insights throughout the conversation. Made the prospect realize a gap they hadn't fully articulated. Used the prospect's own words to frame the value. The value drop was so relevant and specific that the prospect asked follow-up questions unprompted.",
      },
    ],
  },
  {
    dimension: "closingAttempt",
    label: "Closing & Next Steps",
    levels: [
      {
        range: [1, 3],
        description:
          "Failed to attempt a close or transition to next steps. Call ended without a clear ask — either the prospect hung up, or the rep said 'I'll send you some info' with no follow-up plan. No assumptive close, no time options, no concrete next step. The call produced nothing actionable.",
      },
      {
        range: [4, 6],
        description:
          "Attempted a close but it was weak or poorly timed. May have asked 'Would you be open to a meeting?' (non-assumptive) or tried to close before building enough value. Offered vague next steps ('I'll follow up next week') rather than specific time slots. The close felt like an afterthought rather than a natural progression of the conversation.",
      },
      {
        range: [7, 8],
        description:
          "Executed a solid assumptive close with specific next steps. Offered two time options and framed the meeting as valuable even without a purchase. Transitioned smoothly from value/objection handling to the close. Promised something tangible (audit, analysis, report). The prospect understood exactly what would happen next. Slightly mechanical timing or delivery prevented a perfect score.",
      },
      {
        range: [9, 10],
        description:
          "Flawless assumptive close that felt like the only logical next step. The meeting request flowed so naturally from the conversation that it didn't feel like a close at all. Framed the next step around the prospect's specific needs and pain points discussed during the call. Offered clear, tangible value for the meeting. Gave two specific time options with confidence. The prospect agreed enthusiastically or with minimal resistance because the foundation was built perfectly throughout the call.",
      },
    ],
  },
  {
    dimension: "playbookAdherence",
    label: "Playbook Adherence",
    levels: [
      {
        range: [1, 3],
        description:
          "Showed little to no adherence to the playbook framework. Skipped major steps (no pattern interrupt, no pain probe, no value drop). Call was unstructured — jumped straight into a pitch without earning the right, or meandered without direction. Did not follow the sequential flow of the framework. A completely improvised call with no strategic structure.",
      },
      {
        range: [4, 6],
        description:
          "Followed some steps of the playbook but skipped or poorly executed others. May have done a decent opener but jumped to the close without probing for pain. Or probed well but forgot the value drop. The sequential logic of the framework was partially present but the call didn't flow — it felt choppy or out of order. Some steps were clearly recited rather than adapted.",
      },
      {
        range: [7, 8],
        description:
          "Followed the full playbook framework with all 6 steps present and in the right order. Each step was executed competently and the call had a clear strategic arc from opener to close. The flow felt natural rather than robotic. Minor deviations or missed optimizations — for example, the permission bridge could have been smoother, or the pain probe could have gone one question deeper.",
      },
      {
        range: [9, 10],
        description:
          "Masterful execution of the entire framework that felt completely organic. All 6 steps were present, properly sequenced, and adapted to the specific scenario and prospect personality. The playbook was clearly internalized — the rep wasn't following steps, they were having a strategic conversation that happened to follow the framework perfectly. Transitions between steps were invisible. Adapted the framework in real-time based on prospect responses while maintaining the core structure.",
      },
    ],
  },
];
