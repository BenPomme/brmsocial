import { xaiKey, xaiModel } from "./env";

function xaiFastModel() {
  return process.env.XAI_FAST_MODEL?.trim() || "grok-4.3";
}

export async function xaiText(
  system: string,
  user: string,
  opts?: { model?: string; maxTokens?: number; temperature?: number },
): Promise<string | null> {
  const key = xaiKey();
  if (!key) return null;
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: opts?.model ?? xaiModel(),
      temperature: opts?.temperature ?? 0.3,
      max_tokens: opts?.maxTokens ?? 800,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`xAI ${res.status}: ${body.slice(0, 400)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() ?? null;
}

export async function xaiFastText(system: string, user: string): Promise<string | null> {
  return xaiText(system, user, { model: xaiFastModel(), maxTokens: 220, temperature: 0.2 });
}

export async function xaiJson<T>(system: string, user: string): Promise<T | null> {
  const raw = await xaiText(
    `${system}\n\nReturn ONLY valid JSON. No markdown.`,
    user,
  );
  if (!raw) return null;
  const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned) as T;
}
