import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import type { TokenResponse } from "@/lib/types";

export async function POST() {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.error("GOOGLE_API_KEY is not set in environment variables");
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const client = new GoogleGenAI({ apiKey });

    const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const newSessionExpireTime = new Date(Date.now() + 2 * 60 * 1000).toISOString();

    const token = await client.authTokens.create({
      config: {
        uses: 1,
        expireTime: expireTime,
        newSessionExpireTime: newSessionExpireTime,
        httpOptions: { apiVersion: "v1alpha" },
      },
    });

    const response: TokenResponse = {
      token: token.name!,
      expiresAt: expireTime,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to generate token";
    console.error("Token generation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
