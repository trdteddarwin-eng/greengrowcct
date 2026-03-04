import { NextResponse, type NextRequest } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const check = await verifyAdmin();
  if (!check.authorized) {
    return NextResponse.json({ error: check.error }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 100), 500);
  const type = searchParams.get("type");

  const admin = createAdminClient();

  let query = admin
    .from("user_events")
    .select("id, user_id, event_type, metadata, page_path, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (type) {
    query = query.eq("event_type", type);
  }

  const { data: events, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Enrich with display names
  const userIds = [...new Set((events ?? []).map((e) => e.user_id))];
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

  const enriched = (events ?? []).map((e) => ({
    id: e.id,
    userId: e.user_id,
    displayName: nameMap[e.user_id] ?? "Unknown",
    eventType: e.event_type,
    metadata: e.metadata,
    pagePath: e.page_path,
    createdAt: e.created_at,
  }));

  return NextResponse.json({ events: enriched });
}
