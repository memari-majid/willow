import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, type NextFetchEvent } from "next/server";
const authRequests = vi.hoisted(() => ({ count: 0 }));
vi.mock("@/auth", () => ({ auth: (handler: (req: unknown) => unknown) => (req: unknown) => { authRequests.count++; return handler(req); } }));
vi.mock("ai", () => ({ generateText: vi.fn(async () => ({ text: "A fictional educational response." })), generateObject: vi.fn() }));
import { generateText } from "ai";
import { POST } from "@/app/api/demo/chat/route";
import { demoCatalog } from "@/lib/public-demo/catalog";
import proxy from "@/proxy";

let sequence = 0;
function request(body: unknown, address = `test-${++sequence}`) {
  return new Request("https://example.test/api/demo/chat", { method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": address }, body: JSON.stringify(body) });
}
beforeEach(() => { vi.clearAllMocks(); authRequests.count = 0; });
afterEach(() => vi.unstubAllEnvs());

describe("public sample isolation", () => {
  it("generates anonymously from only a server-owned sample, never visitor history", async () => {
    const response = await POST(request({ exampleId: demoCatalog.examples[0].id }));
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(response.headers.get("Set-Cookie")).toBeNull();
    expect(await response.json()).toEqual({ exampleId: demoCatalog.examples[0].id, reply: "A fictional educational response." });
    expect(generateText).toHaveBeenCalledWith(expect.objectContaining({ system: demoCatalog.system, prompt: demoCatalog.examples[0].prompt, experimental_telemetry: { isEnabled: false } }));
    expect(vi.mocked(generateText).mock.calls[0][0]).not.toHaveProperty("messages");
  });
  it.each([
    { exampleId: "not-allowlisted" },
    { exampleId: demoCatalog.examples[0].id, message: "Private text must not be forwarded" },
    { exampleId: demoCatalog.examples[0].id, history: [{ role: "user", content: "Private history" }] },
    { exampleId: demoCatalog.examples[0].id, accountId: "another-account" },
    { exampleId: demoCatalog.examples[0].id, file: "private-upload" },
    { messages: [{ role: "user", content: "Custom text" }] },
  ])("rejects unapproved input before provider access", async (body) => {
    const response = await POST(request(body));
    expect(response.status).toBe(400);
    expect(await response.text()).not.toContain("Private");
    expect(generateText).not.toHaveBeenCalled();
  });
  it("does not mix histories between independent visitors", async () => {
    await POST(request({ exampleId: demoCatalog.examples[0].id }, "visitor-one"));
    await POST(request({ exampleId: demoCatalog.examples[1].id }, "visitor-two"));
    const calls = vi.mocked(generateText).mock.calls;
    expect(calls[0][0].prompt).toBe(demoCatalog.examples[0].prompt);
    expect(calls[1][0].prompt).toBe(demoCatalog.examples[1].prompt);
    expect(calls[1][0]).not.toHaveProperty("messages");
  });
  it("rate limits before an additional provider request", async () => {
    const address = `rate-${++sequence}`;
    for (let i = 0; i < 8; i++) expect((await POST(request({ exampleId: demoCatalog.examples[0].id }, address))).status).toBe(200);
    expect((await POST(request({ exampleId: demoCatalog.examples[0].id }, address))).status).toBe(429);
    expect(generateText).toHaveBeenCalledTimes(8);
  });
  it("does not expose provider errors or request content", async () => {
    vi.mocked(generateText).mockRejectedValueOnce(new Error("sensitive-provider-detail"));
    const response = await POST(request({ exampleId: demoCatalog.examples[0].id }));
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("sensitive-provider-detail");
  });
});
describe("public versus private boundary", () => {
  const event = {} as NextFetchEvent;
  it.each(["/", "/demo", "/api/demo/chat"])("does not consult an account for %s", async (path) => {
    const response = await proxy(new NextRequest(`https://example.test${path}`), event);
    expect(response?.status).toBe(200);
    expect(authRequests.count).toBe(0);
  });
  it.each(["/api/conversations", "/api/me/export", "/api/me/child", "/api/classroom/init", "/api/classroom/session/foreign-session", "/api/research/export/foreign-code", "/api/register"])("blocks anonymous private access to %s", async (path) => {
    const response = await proxy(new NextRequest(`https://example.test${path}`), event);
    expect(response?.status).toBe(401);
  });
  it("keeps private pages behind authentication", async () => {
    expect((await proxy(new NextRequest("https://example.test/settings/data"), event))?.status).toBe(307);
  });
});
