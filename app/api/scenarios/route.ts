import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("custom_scenarios")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch scenarios:", error);
    return NextResponse.json(
      { error: "Failed to fetch scenarios" },
      { status: 500 }
    );
  }

  return NextResponse.json({ scenarios: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const {
    name,
    difficulty,
    industry,
    prospect_name,
    prospect_role,
    prospect_company,
    description,
    prospect_behavior,
    hook,
    icon,
    document_context,
    document_name,
  } = body as Record<string, string | null>;

  if (!name || !difficulty || !prospect_name || !prospect_role || !prospect_company || !description || !prospect_behavior) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("custom_scenarios")
    .insert({
      user_id: user.id,
      name,
      difficulty,
      industry: industry ?? "",
      prospect_name,
      prospect_role,
      prospect_company,
      description,
      prospect_behavior,
      hook: hook ?? "",
      icon: icon ?? "🎯",
      document_context: document_context ?? null,
      document_name: document_name ?? null,
      category: "custom",
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create scenario:", error);
    return NextResponse.json(
      { error: "Failed to create scenario" },
      { status: 500 }
    );
  }

  return NextResponse.json({ scenario: data }, { status: 201 });
}
