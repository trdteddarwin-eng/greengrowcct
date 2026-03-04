import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventType, metadata, pagePath, sessionId } = await request.json();

    if (!eventType || typeof eventType !== "string") {
      return NextResponse.json(
        { error: "eventType is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("user_events").insert({
      user_id: user.id,
      event_type: eventType,
      metadata: metadata ?? {},
      page_path: pagePath ?? null,
      session_id: sessionId ?? null,
    });

    if (error) {
      console.error("Track event insert error:", error);
      return NextResponse.json({ error: "Failed to log event" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
