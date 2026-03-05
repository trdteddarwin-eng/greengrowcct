import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/tasks — current user's assigned tasks for home page
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get user's assignments with task data (RLS ensures only own assignments)
  const { data: assignments, error } = await supabase
    .from("task_assignments")
    .select(`
      id,
      status,
      task_id,
      tasks (
        id,
        title,
        description,
        scenario_id,
        scenario_name,
        due_date,
        status,
        created_at
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get attempt counts and best scores for user's tasks
  const { data: attempts } = await supabase
    .from("task_attempts")
    .select("task_id, assignment_id, score")
    .eq("user_id", user.id);

  // Build attempt summary by assignment
  const attemptSummary: Record<string, { count: number; bestScore: number | null }> = {};
  for (const att of attempts ?? []) {
    if (!attemptSummary[att.assignment_id]) {
      attemptSummary[att.assignment_id] = { count: 0, bestScore: null };
    }
    attemptSummary[att.assignment_id].count++;
    if (att.score != null) {
      const score = Number(att.score);
      const current = attemptSummary[att.assignment_id].bestScore;
      if (current === null || score > current) {
        attemptSummary[att.assignment_id].bestScore = score;
      }
    }
  }

  // Filter to only active tasks and build response
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tasks = (assignments ?? [])
    .filter((a) => {
      const task = a.tasks as any;
      return task && task.status === "active";
    })
    .map((a) => {
      const task = a.tasks as any;
      const summary = attemptSummary[a.id] ?? { count: 0, bestScore: null };
      return {
        id: task.id as string,
        title: task.title as string,
        description: task.description as string,
        scenario_id: task.scenario_id as string,
        scenario_name: task.scenario_name as string,
        due_date: task.due_date as string | null,
        assignment_id: a.id,
        assignment_status: a.status,
        attempt_count: summary.count,
        best_score: summary.bestScore,
        created_at: task.created_at as string,
      };
    });

  return NextResponse.json({ tasks });
}
