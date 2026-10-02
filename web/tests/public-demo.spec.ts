import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("ai", () => ({
  convertToModelMessages: vi.fn(async (messages) => messages),
  streamText: vi.fn(() => ({ toUIMessageStreamResponse: () => new Response("demo reply") })),
}));
vi.mock("@/lib/content", () => ({ loadContent: vi.fn(async () => ({})) }));
vi.mock("@/lib/ai/system-prompt", () => ({
  buildCbtSystemPrompt: vi.fn(() => "existing protocol"),
  ANTHROPIC_CACHE_EPHEMERAL: {},
}));
vi.mock("@/lib/ai/safety", () => ({ detectCrisis: vi.fn(async () => ({ matched: false, keywords: [] })) }));
vi.mock("@/lib/safety/keywords", () => ({ matchesRedFlags: vi.fn(() => false) }));
vi.mock("@/lib/safety/classifier", () => ({ classifyUserMessage: vi.fn(async () => ({ riskLevel: "green", indicators: [] })) }));
vi.mock("@/lib/safety/crisis-response", () => ({ crisisUiResponse: vi.fn(async () => new Response("crisis resources")) }));
vi.mock("@/lib/redis/client", () => ({ chatLimiter: { limit: vi.fn(async () => ({ success: true })) } }));

import { streamText } from "ai";
import { POST } from "@/app/api/demo/chat/route";
import { detectCrisis } from "@/lib/ai/safety";
import { classifyUserMessage } from "@/lib/safety/classifier";
import { crisisUiResponse } from "@/lib/safety/crisis-response";
import { chatLimiter } from "@/lib/redis/client";

function request(role = "user") {
  return new Request("https://www.willowspace.dev/api/demo/chat", {
    method: "POST",
    body: JSON.stringify({ messages: [{ id: "test", role, parts: [{ type: "text", text: "I am nervous about a presentation." }] }] }),
  });
}

describe("public demo", () => {
  beforeEach(() => vi.clearAllMocks());

  it("streams without a login, conversation ID, or persistence", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("demo reply");
    expect(streamText).toHaveBeenCalledOnce();
  });

  it("rejects client-supplied system messages", async () => {
    expect((await POST(request("system"))).status).toBe(400);
    expect(streamText).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON", async () => {
    expect((await POST(new Request("https://example.com", { method: "POST", body: "{" }))).status).toBe(400);
  });

  it("uses crisis resources before generation or classification for keyword risk", async () => {
    vi.mocked(detectCrisis).mockResolvedValueOnce({ matched: true, keywords: ["risk"] });
    expect(await (await POST(request())).text()).toBe("crisis resources");
    expect(classifyUserMessage).not.toHaveBeenCalled();
    expect(streamText).not.toHaveBeenCalled();
    expect(crisisUiResponse).toHaveBeenCalledWith(expect.objectContaining({ userId: null, riskLevel: "red" }));
  });

  it("honors classifier escalation", async () => {
    vi.mocked(classifyUserMessage).mockResolvedValueOnce({ riskLevel: "red", indicators: [], reasoning: "risk" });
    expect(await (await POST(request())).text()).toBe("crisis resources");
    expect(streamText).not.toHaveBeenCalled();
  });

  it("rate limits before model calls", async () => {
    vi.mocked(chatLimiter!.limit).mockResolvedValueOnce({ success: false } as Awaited<ReturnType<NonNullable<typeof chatLimiter>["limit"]>>);
    expect((await POST(request())).status).toBe(429);
    expect(streamText).not.toHaveBeenCalled();
  });

  it("accepts a follow-up with SDK step markers in the assistant history", async () => {
    const response = await POST(new Request("https://example.com/api/demo/chat", {
      method: "POST", body: JSON.stringify({ messages: [
        { id: "u1", role: "user", parts: [{ type: "text", text: "Hello" }] },
        { id: "a1", role: "assistant", parts: [{ type: "step-start" }, { type: "text", text: "What is on your mind?" }] },
        { id: "u2", role: "user", parts: [{ type: "text", text: "My presentation" }] },
      ] }),
    }));
    expect(response.status).toBe(200);
    expect(streamText).toHaveBeenCalledOnce();
  });
});
