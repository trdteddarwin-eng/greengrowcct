export class OpenRouterError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "OpenRouterError";
    this.status = status;
  }
}

interface GenerateJSONOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function generateJSON<T = Record<string, unknown>>(
  prompt: string,
  options: GenerateJSONOptions = {},
): Promise<T> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new OpenRouterError("OPENROUTER_API_KEY is not set", 500);
  }

  const {
    model = "google/gemini-2.5-flash",
    temperature,
    maxTokens,
  } = options;

  const body: Record<string, unknown> = {
    model,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  };

  if (temperature !== undefined) body.temperature = temperature;
  if (maxTokens !== undefined) body.max_tokens = maxTokens;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new OpenRouterError(
      `OpenRouter ${res.status}: ${text || res.statusText}`,
      res.status,
    );
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new OpenRouterError("Empty response from OpenRouter", 502);
  }

  return JSON.parse(content) as T;
}
