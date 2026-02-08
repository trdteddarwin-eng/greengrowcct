// ============================================================
// GreenGrow Digital CCT — Supabase Storage Utilities
// ============================================================

import type { CallSession } from "@/lib/types";
import { defaultPlaybookText } from "@/lib/default-playbook";
import { createClient } from "@/lib/supabase/client";

function getSupabaseClient() {
  try {
    return createClient();
  } catch {
    return null;
  }
}

/**
 * Returns the user's stored playbook text from Supabase,
 * or the default playbook if none has been saved.
 */
export async function getPlaybook(): Promise<string> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return defaultPlaybookText;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return defaultPlaybookText;

    const { data, error } = await supabase
      .from("playbooks")
      .select("text")
      .eq("user_id", user.id)
      .single();

    if (error || !data) return defaultPlaybookText;
    return data.text || defaultPlaybookText;
  } catch {
    return defaultPlaybookText;
  }
}

/**
 * Saves custom playbook text to Supabase (upsert by user_id).
 */
export async function savePlaybook(text: string): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("playbooks").upsert(
      {
        user_id: user.id,
        text,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  } catch (error) {
    console.error("Failed to save playbook:", error);
  }
}

/**
 * Returns the full call history from Supabase, sorted by most recent first.
 */
export async function getCallHistory(): Promise<CallSession[]> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("call_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((row) => ({
      id: row.id,
      scenarioId: row.scenario_id,
      scenarioName: row.scenario_name,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      durationSeconds: row.duration_seconds,
      transcript: row.transcript as CallSession["transcript"],
      scorecard: row.scorecard as CallSession["scorecard"],
    }));
  } catch {
    return [];
  }
}

/**
 * Saves a completed call session to Supabase.
 */
export async function saveCall(session: CallSession): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("call_sessions").insert({
      user_id: user.id,
      scenario_id: session.scenarioId,
      scenario_name: session.scenarioName,
      started_at: session.startedAt,
      ended_at: session.endedAt,
      duration_seconds: session.durationSeconds,
      transcript: session.transcript,
      scorecard: session.scorecard ?? null,
    });
  } catch (error) {
    console.error("Failed to save call:", error);
  }
}

/**
 * Clears all call history for the current user from Supabase.
 */
export async function clearHistory(): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("call_sessions").delete().eq("user_id", user.id);
  } catch (error) {
    console.error("Failed to clear call history:", error);
  }
}
