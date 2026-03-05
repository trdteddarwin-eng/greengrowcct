import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import type { TokenResponse } from "@/lib/types";

export async function POST() {
  const apiKey = process.env.GOOGLE_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured", debug: "GOOGLE_API_KEY is empty or missing" },
      { status: 500 }
    );
  }

  // Debug: return key length and first/last chars to verify it's correct
  const keyDebug = `len=${apiKey.length}, starts=${apiKey.substring(0, 6)}, ends=${apiKey.substring(apiKey.length - 4)}`;

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
    return NextResponse.json({ error: message, keyDebug }, { status: 500 });
  }
}
