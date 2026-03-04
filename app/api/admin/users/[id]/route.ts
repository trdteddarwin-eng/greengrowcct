import { NextResponse, type NextRequest } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await verifyAdmin();
  if (!check.authorized) {
    return NextResponse.json({ error: check.error }, { status: 403 });
  }

  const { id } = await params;
  const admin = createAdminClient();

  // Fetch profile, email, call history, and events in parallel
  const [profileRes, authRes, callsRes, eventsRes] = await Promise.all([
    admin.from("profiles").select("*").eq("id", id).single(),
    admin.auth.admin.getUserById(id),
    admin
      .from("call_sessions")
      .select("id, scenario_name, created_at, duration_seconds, scorecard")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
    admin
      .from("user_events")
      .select("id, event_type, metadata, page_path, created_at")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (profileRes.error || !profileRes.data) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const profile = profileRes.data;
  const email = authRes.data?.user?.email ?? "";

  // Compute best score from call history
  const calls = (callsRes.data ?? []).map((c) => ({
    id: c.id,
    scenarioName: c.scenario_name,
    date: c.created_at,
    durationSeconds: c.duration_seconds,
    score: c.scorecard ? Number((c.scorecard as Record<string, unknown>).overallScore ?? 0) : 0,
  }));

  const bestScore = calls.length > 0 ? Math.max(...calls.map((c) => c.score)) : 0;

  return NextResponse.json({
    profile: {
      id: profile.id,
      displayName: profile.display_name ?? "Unknown",
      email,
      role: profile.role,
      totalCalls: profile.total_calls,
      avgScore: Number(profile.avg_score),
      bestScore,
      lastActive: profile.last_active_at,
      joined: profile.created_at,
    },
    calls,
    events: eventsRes.data ?? [],
  });
}
