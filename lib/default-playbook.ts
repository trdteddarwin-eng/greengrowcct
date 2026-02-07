// ============================================================
// GreenGrow Digital CCT — Default Playbook
// ============================================================

import type { Playbook } from "@/lib/types";

export const defaultPlaybookText = `THE PATTERN INTERRUPT COLD CALL FRAMEWORK
=========================================

This playbook is designed for B2B outbound calls selling digital marketing services to local businesses. Every step is engineered to break the prospect's autopilot "not interested" response and create a real conversation.

STEP 1: PATTERN INTERRUPT OPENER (First 10 Seconds)
----------------------------------------------------
Goal: Break the prospect's mental script. They expect "Hi, my name is X from Y, how are you today?" — do the opposite.

Open with honesty, energy, and a micro-hook that makes them pause instead of hanging up. Acknowledge the cold call upfront — this builds instant credibility because nobody does it.

Example:
"Hey [Name], this is [Your Name] with GreenGrow Digital — I know this is a cold call, which is probably the worst part of your day, but I found something about [Company Name] that I had to share. Got 30 seconds?"

Key principles:
- Use their first name immediately
- Acknowledge it's a cold call (disarms them)
- Inject light humor or self-awareness
- Mention their company name to show it's not a blind dial
- Ask for a small time commitment (30 seconds, not 15 minutes)


STEP 2: PERMISSION BRIDGE
--------------------------
Goal: Earn the right to continue the conversation. After the pattern interrupt, the prospect is curious but hasn't committed. Bridge to your pitch by asking for explicit permission.

This is critical because when people give micro-commitments ("sure, go ahead"), they psychologically commit to listening.

Example:
"I'll be super quick — I work with [industry] businesses in [region] and we've been getting some crazy results with a new approach to [specific channel]. Before I explain, can I ask you one quick question?"

Key principles:
- Restate brevity ("I'll be quick")
- Establish relevance (their industry, their region)
- Tease a result without revealing the full pitch
- Ask permission to ask a question (double opt-in)
- The question must be about THEM, not about you


STEP 3: PAIN PROBE
-------------------
Goal: Uncover the prospect's specific pain point. Don't pitch — diagnose. Ask questions that make the prospect realize they have a problem they haven't fully articulated.

The best cold callers spend 60% of the call listening. A good pain probe question makes the prospect say "Yeah, actually..." and then they start talking about their frustrations.

Example:
"When it comes to getting new [customers/patients/clients], what's your biggest challenge right now — is it getting enough leads, or is it more about converting the ones you already have?"

Key principles:
- Ask open-ended questions, not yes/no
- Offer two options (A or B) to make it easier to answer
- Listen for emotional words (frustrated, overwhelmed, tired of)
- Let them talk — don't interrupt
- Take mental notes on specifics they mention
- Mirror their language back to them


STEP 4: VALUE DROP
-------------------
Goal: Deliver a specific, relevant insight that proves you can help. This is NOT your full pitch — it's a single, sharp data point or case study that directly relates to the pain they just described.

The value drop must feel custom, not scripted. Use what they told you in Step 3 to connect your solution to their specific pain.

Example:
"That's exactly what we heard from [similar company] — they were spending $3K/month on ads but only booking 8 appointments. We rebuilt their targeting around [specific strategy] and they went to 35 appointments in 60 days at the same budget. The issue wasn't their spending — it was where the money was going."

Key principles:
- Reference a similar business (industry, size, region)
- Use specific numbers (not "we got great results")
- Connect the case study to THEIR pain point
- Keep it under 30 seconds
- Make it about results, not your process
- Never say "we're the best" — let the data speak


STEP 5: OBJECTION JUJITSU
---------------------------
Goal: Handle pushback without being pushy. Objections are buying signals — they mean the prospect is engaged enough to respond. Use the "Agree, Ask, Advance" framework:

1. AGREE: Validate their concern ("That makes total sense")
2. ASK: Ask a question that reframes the objection ("Can I ask what happened with the last agency?")
3. ADVANCE: Offer a low-commitment next step ("What if I just sent you a free audit?")

Example:
Prospect: "We already tried digital ads and they didn't work."
Rep: "I hear that a lot, and honestly, most of the time the ads weren't the problem — it was the strategy behind them. Can I ask what the setup looked like? Were they sending traffic to a landing page or your main website? Because 8 out of 10 times, that's exactly where it broke down. What if I took a 10-minute look at what was done before and showed you specifically what went wrong? No cost, no commitment."

Key principles:
- Never argue or get defensive
- Never say "I understand, but..." — the "but" negates everything before it
- Use "and" instead of "but"
- Match their energy level
- Offer a low-risk next step, not a big commitment
- Reframe the objection as a solvable problem


STEP 6: ASSUMPTIVE CLOSE
--------------------------
Goal: Transition to a booked meeting without asking "Would you like to meet?" The assumptive close presents the meeting as the obvious, logical next step — not a big decision.

Don't ask IF they want to meet. Ask WHEN. Give two specific time options (Tuesday or Thursday, morning or afternoon) to make it a simple choice.

Example:
"Here's what I think makes sense — let me put together a quick competitive analysis for your market and walk you through it. It takes about 15 minutes and you'll walk away with actionable intel even if we never work together. I've got availability Tuesday at 10am or Thursday at 2pm — which works better for you?"

Key principles:
- Frame the meeting as valuable even if they don't buy
- Offer something tangible they'll receive (audit, analysis, report)
- Give exactly two time options (not "when are you free?")
- Use assumptive language ("here's what makes sense" not "would you be open to")
- Keep it low commitment (15 minutes, not an hour)
- Confirm the appointment with email/calendar invite immediately`;

export const defaultPlaybook: Playbook = {
  title: "The Pattern Interrupt Cold Call Framework",
  steps: [
    {
      name: "Pattern Interrupt Opener",
      description:
        "Break the prospect's mental script in the first 10 seconds. Acknowledge the cold call upfront to build credibility, use their name and company to show it's not a blind dial, inject humor or self-awareness, and ask for a small time commitment like 30 seconds.",
      example:
        "Hey [Name], this is [Your Name] with GreenGrow Digital — I know this is a cold call, which is probably the worst part of your day, but I found something about [Company Name] that I had to share. Got 30 seconds?",
    },
    {
      name: "Permission Bridge",
      description:
        "Earn the right to continue the conversation by asking for explicit micro-permission. Restate brevity, establish relevance to their industry and region, tease a result without revealing the full pitch, and ask permission to ask a question — creating a double opt-in that psychologically commits them to listening.",
      example:
        "I'll be super quick — I work with [industry] businesses in [region] and we've been getting some crazy results with a new approach to [specific channel]. Before I explain, can I ask you one quick question?",
    },
    {
      name: "Pain Probe",
      description:
        "Uncover the prospect's specific pain point by asking diagnostic questions, not pitching. Spend 60% of the call listening. Offer A-or-B options to make it easy to answer, listen for emotional words, mirror their language, and let them talk without interrupting.",
      example:
        "When it comes to getting new [customers/patients/clients], what's your biggest challenge right now — is it getting enough leads, or is it more about converting the ones you already have?",
    },
    {
      name: "Value Drop",
      description:
        "Deliver a single, sharp data point or case study that directly relates to the pain they just described. Reference a similar business, use specific numbers, keep it under 30 seconds, and make it about results — not your process.",
      example:
        "That's exactly what we heard from [similar company] — they were spending $3K/month on ads but only booking 8 appointments. We rebuilt their targeting around [specific strategy] and they went to 35 appointments in 60 days at the same budget. The issue wasn't their spending — it was where the money was going.",
    },
    {
      name: "Objection Jujitsu",
      description:
        "Handle pushback using the Agree-Ask-Advance framework: validate their concern, ask a reframing question, then offer a low-commitment next step. Never argue, never say 'but,' and always reframe objections as solvable problems.",
      example:
        "I hear that a lot, and honestly, most of the time the ads weren't the problem — it was the strategy behind them. Can I ask what the setup looked like? Were they sending traffic to a landing page or your main website? Because 8 out of 10 times, that's exactly where it broke down. What if I took a 10-minute look at what was done before and showed you specifically what went wrong?",
    },
    {
      name: "Assumptive Close",
      description:
        "Transition to a booked meeting without asking 'Would you like to meet?' — ask WHEN, not IF. Frame the meeting as valuable even if they don't buy, offer something tangible (audit, report), give exactly two time options, and use assumptive language.",
      example:
        "Here's what I think makes sense — let me put together a quick competitive analysis for your market and walk you through it. It takes about 15 minutes and you'll walk away with actionable intel even if we never work together. I've got availability Tuesday at 10am or Thursday at 2pm — which works better for you?",
    },
  ],
  rawText: "", // Will be set below
};

// Set rawText to the full playbook text
defaultPlaybook.rawText = defaultPlaybookText;
