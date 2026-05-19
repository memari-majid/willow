import { tool, type ToolSet } from "ai";
import { z } from "zod";

import {
  forgetMemory,
  insertUserMemory,
  upsertUserPreference,
} from "@/lib/memory/store";
import { memoryContentAllowed } from "@/lib/memory/pii-guard";

export type MemoryToolContext = {
  userId: string;
  conversationId: string;
  /** When true, memory writes are blocked (crisis path). */
  blockWrites?: boolean;
};

export function makeMemoryTools(ctx: MemoryToolContext) {
  const rememberFact = tool({
    description:
      "Save a durable fact about the user for future sessions (job, relationships, recurring triggers). Do NOT store crisis content, diagnoses, SSN, credit cards, or phone numbers.",
    inputSchema: z.object({
      content: z.string().max(2000),
      kind: z.enum(["fact", "relationship", "context"]),
    }),
    execute: async (input) => {
      if (ctx.blockWrites) {
        return { ok: false as const, error: "Memory disabled this turn" };
      }
      if (!memoryContentAllowed(input.content)) {
        return { ok: false as const, error: "Content not allowed to store" };
      }
      const row = await insertUserMemory({
        userId: ctx.userId,
        kind: input.kind,
        content: input.content.trim(),
        source: "tool_inferred",
        conversationId: ctx.conversationId,
      });
      return { ok: true as const, id: row.id, content: row.content };
    },
  });

  const updatePreference = tool({
    description:
      "Update the user's communication preferences when they explicitly ask (formality, directness, pace, topics to avoid).",
    inputSchema: z.object({
      key: z.enum([
        "formality",
        "directness",
        "pace",
        "language",
        "preferred_pronouns",
        "avoid",
      ]),
      value: z.union([z.string(), z.number()]),
      evidence: z.string().optional(),
    }),
    execute: async (input) => {
      if (ctx.blockWrites) {
        return { ok: false as const, error: "Memory disabled this turn" };
      }
      const patch: Record<string, unknown> = {};
      if (input.key === "avoid") {
        const existing = await upsertUserPreference(ctx.userId, {});
        const list = [...(existing.avoidList ?? []), String(input.value)];
        patch.avoidList = [...new Set(list)];
      } else if (input.key === "preferred_pronouns") {
        patch.preferredPronouns = String(input.value);
      } else if (input.key === "directness") {
        patch.directness =
          typeof input.value === "number"
            ? input.value
            : Number.parseInt(String(input.value), 10);
      } else {
        patch[input.key] = String(input.value);
      }
      await upsertUserPreference(ctx.userId, patch);
      if (input.evidence) {
        await insertUserMemory({
          userId: ctx.userId,
          kind: "preference_note",
          content: `${input.key}=${String(input.value)}: ${input.evidence}`,
          source: "tool_inferred",
          conversationId: ctx.conversationId,
        });
      }
      return { ok: true as const, key: input.key };
    },
  });

  const forgetFact = tool({
    description: "Remove a stored memory when the user asks to forget it.",
    inputSchema: z.object({
      memoryId: z.string().uuid(),
    }),
    execute: async (input) => {
      const row = await forgetMemory(ctx.userId, input.memoryId);
      if (!row) return { ok: false as const, error: "Not found" };
      return { ok: true as const, id: row.id };
    },
  });

  const proposePreferenceUpdate = tool({
    description:
      "Propose a preference change when the user repeatedly corrects tone — does NOT auto-apply; user reviews in Settings.",
    inputSchema: z.object({
      key: z.string(),
      value: z.string(),
      evidence: z.string(),
    }),
    execute: async (input) => {
      if (ctx.blockWrites) {
        return { ok: false as const, error: "Memory disabled this turn" };
      }
      const row = await insertUserMemory({
        userId: ctx.userId,
        kind: "preference_note",
        content: `[proposed] ${input.key}=${input.value} — ${input.evidence}`,
        source: "tool_inferred",
        conversationId: ctx.conversationId,
        pinned: false,
      });
      return {
        ok: true as const,
        id: row.id,
        message: "User can accept in Settings → Memory",
      };
    },
  });

  return {
    remember_fact: rememberFact,
    update_preference: updatePreference,
    forget_fact: forgetFact,
    propose_preference_update: proposePreferenceUpdate,
  } satisfies ToolSet;
}

export type MemoryTools = ReturnType<typeof makeMemoryTools>;
