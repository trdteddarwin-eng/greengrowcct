import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/tasks/[id]/attempt — record a practice attempt
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: taskId } = await params;
  const body = await request.json();
  const { assignment_id, score, duration_seconds } = body;

  if (!assignment_id) {
    return NextResponse.json(
      { error: "assignment_id is required" },
      { status: 400 }
    );
  }

  // Verify the assignment belongs to this user (RLS also enforces this)
  const { data: assignment, error: assignError } = await supabase
    .from("task_assignments")
    .select("id, user_id")
    .eq("id", assignment_id)
    .eq("user_id", user.id)
    .single();

  if (assignError || !assignment) {
    return NextResponse.json(
      { error: "Assignment not found" },
      { status: 404 }
    );
  }

  // Mark assignment as in_progress if still pending
  await supabase
    .from("task_assignments")
    .update({ status: "in_progress" })
    .eq("id", assignment_id)
    .eq("status", "pending");

  // Insert attempt (trigger will auto-complete assignment if score is present)
  const { data: attempt, error: attemptError } = await supabase
    .from("task_attempts")
    .insert({
      task_id: taskId,
      assignment_id,
      user_id: user.id,
      score: score ?? null,
      duration_seconds: duration_seconds ?? null,
      completed_at: score != null ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (attemptError) {
    return NextResponse.json(
      { error: attemptError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ attempt }, { status: 201 });
}
