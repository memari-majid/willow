import { generateText } from "ai";
import { z } from "zod";
import { demoCatalog } from "@/lib/public-demo/catalog";
import { allowDemoRequest } from "@/lib/public-demo/rate-limit";

export const maxDuration = 60;
const input = z.object({ exampleId: z.string().min(1).max(40) }).strict();
const headers = { "Cache-Control": "no-store, private" };
export async function POST(req: Request) {
  const raw = await req.text();
  if (raw.length > 160) return Response.json({ error: "Choose a listed fictional example." }, { status: 400, headers });
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return Response.json({ error: "Choose a listed fictional example." }, { status: 400, headers }); }
  const parsed = input.safeParse(body);
  const example = parsed.success ? demoCatalog.examples.find((item) => item.id === parsed.data.exampleId) : undefined;
  if (!example) return Response.json({ error: "Choose a listed fictional example." }, { status: 400, headers });
  if (!allowDemoRequest(req)) return Response.json({ error: "Please try again in a few minutes." }, { status: 429, headers: { ...headers, "Retry-After": "300" } });
  try {
    const { text } = await generateText({
      model: "openai/gpt-4o-mini", system: demoCatalog.system, prompt: example.prompt,
      maxOutputTokens: 450, experimental_telemetry: { isEnabled: false },
    });
    return Response.json({ exampleId: example.id, reply: text }, { headers });
  } catch { return Response.json({ error: "This example is temporarily unavailable." }, { status: 503, headers }); }
}
