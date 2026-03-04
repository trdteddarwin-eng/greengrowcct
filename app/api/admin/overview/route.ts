import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const check = await verifyAdmin();
  if (!check.authorized) {
    return NextResponse.json({ error: check.error }, { status: 403 });
  }

  const admin = createAdminClient();

  // Run all queries in parallel
  const [
    usersRes,
    callsRes,
    callsTodayRes,
    avgScoreRes,
    activeTodayRes,
    callsByDayRes,
    recentActivityRes,
  ] = await Promise.all([
    // Total users
    admin.from("profiles").select("id", { count: "exact", head: true }),

    // Total calls
    admin.from("call_sessions").select("id", { count: "exact", head: true }),

    // Calls today
    admin
      .from("call_sessions")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),

    // Avg score across all users with calls
    admin.from("profiles").select("avg_score").gt("total_calls", 0),

    // Active today (last 24h)
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("last_active_at", new Date(Date.now() - 86400000).toISOString()),

    // Calls by day (last 7 days)
    admin
      .from("call_sessions")
      .select("created_at")
      .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString())
      .order("created_at", { ascending: true }),

    // Recent activity (last 50 events)
    admin
      .from("user_events")
      .select("id, user_id, event_type, metadata, page_path, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  // Compute avg score
  const scores = avgScoreRes.data ?? [];
  const globalAvg =
    scores.length > 0
      ? Math.round(
          (scores.reduce((sum, p) => sum + Number(p.avg_score), 0) /
            scores.length) *
            10
        ) / 10
      : 0;

  // Bucket calls by day
  const callsByDay: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    callsByDay[d.toISOString().slice(0, 10)] = 0;
  }
  for (const row of callsByDayRes.data ?? []) {
    const day = row.created_at.slice(0, 10);
    if (day in callsByDay) callsByDay[day]++;
  }

  // Enrich recent activity with display names
  const recentEvents = recentActivityRes.data ?? [];
  const userIds = [...new Set(recentEvents.map((e) => e.user_id))];
  let nameMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds);
    nameMap = Object.fromEntries(
      (profiles ?? []).map((p) => [p.id, p.display_name ?? "Unknown"])
    );
  }

  const recentActivity = recentEvents.map((e) => ({
    id: e.id,
    userId: e.user_id,
    displayName: nameMap[e.user_id] ?? "Unknown",
    eventType: e.event_type,
    metadata: e.metadata,
    pagePath: e.page_path,
    createdAt: e.created_at,
  }));

  return NextResponse.json({
    totalUsers: usersRes.count ?? 0,
    totalCalls: callsRes.count ?? 0,
    callsToday: callsTodayRes.count ?? 0,
    avgScore: globalAvg,
    activeToday: activeTodayRes.count ?? 0,
    callsByDay: Object.entries(callsByDay).map(([date, count]) => ({
      date,
      count,
    })),
    recentActivity,
  });
}
