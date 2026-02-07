import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const browserId = searchParams.get("browser_id");

  if (!browserId) {
    return NextResponse.json(
      { error: "browser_id is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("custom_scenarios")
    .select("*")
    .eq("browser_id", browserId)
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
    browser_id,
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

  if (!browser_id || !name || !difficulty || !prospect_name || !prospect_role || !prospect_company || !description || !prospect_behavior) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("custom_scenarios")
    .insert({
      browser_id,
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
