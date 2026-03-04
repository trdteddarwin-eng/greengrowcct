import { NextResponse, type NextRequest } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const check = await verifyAdmin();
  if (!check.authorized) {
    return NextResponse.json({ error: check.error }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const sort = searchParams.get("sort") ?? "created_at";
  const order = searchParams.get("order") ?? "desc";

  const admin = createAdminClient();

  // Get all profiles
  let query = admin
    .from("profiles")
    .select("id, display_name, role, total_calls, avg_score, last_active_at, created_at");

  if (search) {
    query = query.ilike("display_name", `%${search}%`);
  }

  const ascending = order === "asc";
  query = query.order(sort, { ascending });

  const { data: profiles, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get emails from auth.users via admin API
  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const emailMap: Record<string, string> = {};
  for (const u of authData?.users ?? []) {
    emailMap[u.id] = u.email ?? "";
  }

  const users = (profiles ?? []).map((p) => ({
    id: p.id,
    displayName: p.display_name ?? "Unknown",
    email: emailMap[p.id] ?? "",
    role: p.role,
    totalCalls: p.total_calls,
    avgScore: Number(p.avg_score),
    lastActive: p.last_active_at,
    joined: p.created_at,
  }));

  return NextResponse.json({ users });
}
