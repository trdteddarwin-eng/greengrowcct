import { NextResponse, type NextRequest } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/admin/tasks/[id] — task detail with all assignments + attempts
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

  // Fetch task
  const { data: task, error: taskError } = await admin
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();

  if (taskError || !task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  // Fetch assignments
  const { data: assignments } = await admin
    .from("task_assignments")
    .select("*")
    .eq("task_id", id)
    .order("created_at", { ascending: true });

  // Fetch attempts
  const { data: attempts } = await admin
    .from("task_attempts")
    .select("*")
    .eq("task_id", id)
    .order("started_at", { ascending: false });

  // Get user info for assigned users
  const userIds = (assignments ?? []).map((a) => a.user_id);
  let nameMap: Record<string, string> = {};
  let emailMap: Record<string, string> = {};

  if (userIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds);
    nameMap = Object.fromEntries(
      (profiles ?? []).map((p) => [p.id, p.display_name ?? "Unknown"])
    );

    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
    for (const u of authData?.users ?? []) {
      if (userIds.includes(u.id)) {
        emailMap[u.id] = u.email ?? "";
      }
    }
  }

  // Group attempts by assignment
  const attemptsByAssignment: Record<string, typeof attempts> = {};
  for (const att of attempts ?? []) {
    if (!attemptsByAssignment[att.assignment_id]) {
      attemptsByAssignment[att.assignment_id] = [];
    }
    attemptsByAssignment[att.assignment_id]!.push(att);
  }

  // Build enriched assignments
  const enrichedAssignments = (assignments ?? []).map((a) => {
    const userAttempts = attemptsByAssignment[a.id] ?? [];
    const scores = userAttempts
      .filter((att) => att.score != null)
      .map((att) => Number(att.score));

    return {
      id: a.id,
      user_id: a.user_id,
      display_name: nameMap[a.user_id] ?? "Unknown",
      email: emailMap[a.user_id] ?? "",
      status: a.status,
      completed_at: a.completed_at,
      attempts: userAttempts,
      best_score: scores.length > 0 ? Math.max(...scores) : null,
    };
  });

  return NextResponse.json({
    task,
    assignments: enrichedAssignments,
  });
}

// PATCH /api/admin/tasks/[id] — update/archive task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const check = await verifyAdmin();
  if (!check.authorized) {
    return NextResponse.json({ error: check.error }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  // Only allow updating specific fields
  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.due_date !== undefined) updates.due_date = body.due_date;
  if (body.status !== undefined) updates.status = body.status;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: task, error } = await admin
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task });
}
