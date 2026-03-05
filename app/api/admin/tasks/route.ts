import { NextResponse, type NextRequest } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/admin/tasks — list all tasks with assignment summaries
export async function GET() {
  const check = await verifyAdmin();
  if (!check.authorized) {
    return NextResponse.json({ error: check.error }, { status: 403 });
  }

  const admin = createAdminClient();

  // Get all tasks ordered by most recent
  const { data: tasks, error } = await admin
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get assignment counts and scores for each task
  const taskIds = (tasks ?? []).map((t) => t.id);

  if (taskIds.length === 0) {
    return NextResponse.json({ tasks: [] });
  }

  const { data: assignments } = await admin
    .from("task_assignments")
    .select("task_id, status")
    .in("task_id", taskIds);

  const { data: attempts } = await admin
    .from("task_attempts")
    .select("task_id, score")
    .in("task_id", taskIds)
    .not("score", "is", null);

  // Build summaries
  const summaryMap: Record<string, { total: number; completed: number; scores: number[] }> = {};
  for (const a of assignments ?? []) {
    if (!summaryMap[a.task_id]) {
      summaryMap[a.task_id] = { total: 0, completed: 0, scores: [] };
    }
    summaryMap[a.task_id].total++;
    if (a.status === "completed") summaryMap[a.task_id].completed++;
  }
  for (const att of attempts ?? []) {
    if (summaryMap[att.task_id] && att.score != null) {
      summaryMap[att.task_id].scores.push(Number(att.score));
    }
  }

  const enriched = (tasks ?? []).map((t) => {
    const s = summaryMap[t.id] ?? { total: 0, completed: 0, scores: [] };
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      scenario_id: t.scenario_id,
      scenario_name: t.scenario_name,
      due_date: t.due_date,
      status: t.status,
      created_at: t.created_at,
      total_assigned: s.total,
      completed_count: s.completed,
      avg_score:
        s.scores.length > 0
          ? Math.round((s.scores.reduce((a, b) => a + b, 0) / s.scores.length) * 10) / 10
          : null,
    };
  });

  return NextResponse.json({ tasks: enriched });
}

// POST /api/admin/tasks — create a task + assign to users
export async function POST(request: NextRequest) {
  const check = await verifyAdmin();
  if (!check.authorized) {
    return NextResponse.json({ error: check.error }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, scenario_id, scenario_name, due_date, user_ids } = body;

  if (!title || !scenario_id || !scenario_name) {
    return NextResponse.json(
      { error: "title, scenario_id, and scenario_name are required" },
      { status: 400 }
    );
  }

  if (!Array.isArray(user_ids) || user_ids.length === 0) {
    return NextResponse.json(
      { error: "user_ids must be a non-empty array" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Create the task
  const { data: task, error: taskError } = await admin
    .from("tasks")
    .insert({
      created_by: check.userId,
      title,
      description: description ?? "",
      scenario_id,
      scenario_name,
      due_date: due_date ?? null,
    })
    .select()
    .single();

  if (taskError || !task) {
    return NextResponse.json(
      { error: taskError?.message ?? "Failed to create task" },
      { status: 500 }
    );
  }

  // Create assignments for each user
  const assignmentRows = (user_ids as string[]).map((uid) => ({
    task_id: task.id,
    user_id: uid,
  }));

  const { error: assignError } = await admin
    .from("task_assignments")
    .insert(assignmentRows);

  if (assignError) {
    return NextResponse.json(
      { error: assignError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ task }, { status: 201 });
}
