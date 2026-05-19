import { tool, type ToolSet } from "ai";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import {
  behavioralActivations,
  doubtLabels,
  homework,
  moodRatings,
  safetyEvents,
  safetyPlans,
  thoughtRecords,
} from "@/lib/db/schema";

export type CbtToolContext = {
  userId: string;
  conversationId: string;
};

export function makeCbtTools(ctx: CbtToolContext) {
  const moodCheck = tool({
    description:
      "Record a mood rating. Invoke at the start of a session and after a substantial intervention.",
    inputSchema: z.object({
      emotion: z.enum([
        "sadness",
        "anxiety",
        "anger",
        "irritability",
        "hopelessness",
        "guilt",
        "shame",
        "overwhelm",
        "numbness",
        "other",
      ]),
      emotionLabel: z
        .string()
        .describe('If "other", the user-provided emotion label'),
      rating: z.number().int().min(0).max(10),
      notes: z.string().optional(),
    }),
    execute: async (input) => {
      const emotion =
        input.emotion === "other" ? input.emotionLabel : input.emotion;
      const [row] = await db
        .insert(moodRatings)
        .values({
          userId: ctx.userId,
          conversationId: ctx.conversationId,
          emotion,
          rating: input.rating,
          notes: input.notes ?? null,
        })
        .returning();
      return { ok: true as const, id: row.id };
    },
  });

  const thoughtRecord = tool({
    description:
      'Complete a structured CBT thought record ("Go Time"). Call only when the COMPLETED record is ready.',
    inputSchema: z.object({
      situation: z.string(),
      bodyResponse: z.string(),
      automaticThought: z.string(),
      emotion: z.string(),
      emotionRatingBefore: z.number().int().min(0).max(10),
      thinkingErrors: z
        .array(
          z.enum([
            "all_or_nothing",
            "emotional_reasoning",
            "negative_self_labeling",
            "mental_filter",
            "disqualifying_positive",
            "mind_reading",
            "fortune_telling",
            "catastrophizing",
            "should_statements",
            "personalization",
            "magnification_minimization",
          ]),
        )
        .optional(),
      doubtLabel: z.string().optional(),
      evidenceFor: z.string(),
      evidenceAgainst: z.string(),
      alternativeView: z.string(),
      rethink: z.string(),
      emotionRatingAfter: z.number().int().min(0).max(10),
      respond: z.string(),
    }),
    execute: async (input) => {
      const [row] = await db
        .insert(thoughtRecords)
        .values({
          userId: ctx.userId,
          conversationId: ctx.conversationId,
          ...input,
          thinkingErrors: input.thinkingErrors ?? null,
          doubtLabel: input.doubtLabel ?? null,
          status: "completed",
          completedAt: new Date(),
        })
        .returning();

      if (input.doubtLabel?.trim()) {
        const label = input.doubtLabel.trim();
        const existing = await db
          .select()
          .from(doubtLabels)
          .where(
            and(eq(doubtLabels.userId, ctx.userId), eq(doubtLabels.label, label)),
          )
          .limit(1);
        if (existing[0]) {
          await db
            .update(doubtLabels)
            .set({
              occurrenceCount: (existing[0].occurrenceCount ?? 1) + 1,
            })
            .where(eq(doubtLabels.id, existing[0].id));
        } else {
          await db.insert(doubtLabels).values({
            userId: ctx.userId,
            label,
          });
        }
      }

      return { ok: true as const, id: row.id };
    },
  });

  const safetyPlanTool = tool({
    description:
      "Create a Stanley-Brown–style safety plan when the user agrees and is not in acute crisis.",
    inputSchema: z.object({
      warningSigns: z.array(z.string()).min(1),
      internalCopingStrategies: z.array(z.string()).min(2),
      socialDistractions: z.array(
        z.object({
          name: z.string(),
          phone: z.string().optional(),
          place: z.string().optional(),
        }),
      ),
      peopleForHelp: z.array(
        z.object({ name: z.string(), phone: z.string() }),
      ),
      professionals: z.array(
        z.object({
          name: z.string(),
          phone: z.string(),
          type: z.enum(["clinician", "crisis_line", "emergency"]),
        }),
      ),
      environmentSafety: z.array(z.string()),
      reasonsForLiving: z.array(z.string()).optional(),
    }),
    execute: async (input) => {
      const [row] = await db
        .insert(safetyPlans)
        .values({
          userId: ctx.userId,
          warningSigns: input.warningSigns,
          internalCopingStrategies: input.internalCopingStrategies,
          socialDistractions: input.socialDistractions,
          peopleForHelp: input.peopleForHelp,
          professionals: input.professionals,
          environmentSafety: input.environmentSafety,
          reasonsForLiving: input.reasonsForLiving ?? null,
        })
        .returning();
      return {
        ok: true as const,
        id: row.id,
        planUrl: `/safety-plan/${row.id}`,
      };
    },
  });

  const behavioralActivation = tool({
    description:
      "Schedule a behavioral activation activity after the user picks one.",
    inputSchema: z.object({
      activity: z.string(),
      type: z.enum(["pleasure", "mastery", "both"]),
      scheduledFor: z.string().describe("ISO 8601 datetime"),
      moodPrediction: z.number().int().min(0).max(10),
      notes: z.string().optional(),
    }),
    execute: async (input) => {
      const [row] = await db
        .insert(behavioralActivations)
        .values({
          userId: ctx.userId,
          conversationId: ctx.conversationId,
          activity: input.activity,
          type: input.type,
          scheduledFor: new Date(input.scheduledFor),
          moodPrediction: input.moodPrediction,
          notes: input.notes ?? null,
        })
        .returning();
      return { ok: true as const, id: row.id };
    },
  });

  const homeworkAssign = tool({
    description:
      "Assign between-session homework. If confidence is below 7, renegotiate before calling.",
    inputSchema: z.object({
      assignment: z.string(),
      rationale: z.string().optional(),
      scheduledFor: z.string().optional(),
      confidenceRating: z.number().int().min(0).max(10),
    }),
    execute: async (input) => {
      const [row] = await db
        .insert(homework)
        .values({
          userId: ctx.userId,
          conversationId: ctx.conversationId,
          assignment: input.assignment,
          rationale: input.rationale ?? null,
          scheduledFor: input.scheduledFor
            ? new Date(input.scheduledFor)
            : null,
          confidenceRating: input.confidenceRating,
          status: "assigned",
        })
        .returning();
      return { ok: true as const, id: row.id };
    },
  });

  const homeworkReview = tool({
    description: "Review homework outcome after the user reports back.",
    inputSchema: z.object({
      homeworkId: z.string().uuid(),
      status: z.enum(["completed", "skipped", "in_progress"]),
      outcome: z.string().optional(),
    }),
    execute: async (input) => {
      const [row] = await db
        .update(homework)
        .set({
          status: input.status,
          outcome: input.outcome ?? null,
          reviewedAt: new Date(),
        })
        .where(
          and(eq(homework.id, input.homeworkId), eq(homework.userId, ctx.userId)),
        )
        .returning();
      if (!row) return { ok: false as const, error: "Not found" };
      return { ok: true as const, id: row.id };
    },
  });

  const crisisEscalate = tool({
    description:
      "Invoke on yellow/red safety paths to log and surface crisis resources (deterministic resource list).",
    inputSchema: z.object({
      riskLevel: z.enum(["yellow", "red"]),
      indicators: z.array(z.string()),
    }),
    execute: async (input) => {
      await db.insert(safetyEvents).values({
        userId: ctx.userId,
        conversationId: ctx.conversationId,
        messageId: null,
        classifierVersion: "v1",
        riskLevel: input.riskLevel,
        indicators: input.indicators,
        responseTaken: "crisis_escalate_tool",
        reviewedByHuman: false,
      });
      return {
        resources: {
          us: [
            "988 Suicide & Crisis Lifeline (call or text)",
            "Crisis Text Line: text HOME to 741741",
            "911 for emergencies",
          ],
        },
        riskLevel: input.riskLevel,
      };
    },
  });

  return {
    mood_check: moodCheck,
    thought_record: thoughtRecord,
    safety_plan: safetyPlanTool,
    behavioral_activation: behavioralActivation,
    homework_assign: homeworkAssign,
    homework_review: homeworkReview,
    crisis_escalate: crisisEscalate,
  } satisfies ToolSet;
}

export type CbtTools = ReturnType<typeof makeCbtTools>;
