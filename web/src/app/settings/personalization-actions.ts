"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { updateMemoryContent } from "@/lib/memory/store";
import { memoryContentAllowed } from "@/lib/memory/pii-guard";
import { insertUserCorrection } from "@/lib/personalization/corrections-store";
import { updateInferenceState } from "@/lib/personalization/inference-store";
import {
  optInPersonalizationResearch,
  revokePersonalizationResearch,
} from "@/lib/personalization/consent-store";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function confirmInferenceAction(inferenceId: string) {
  const userId = await requireUserId();
  await insertUserCorrection({
    userId,
    targetType: "inference",
    targetId: inferenceId,
    action: "accept",
  });
  revalidatePath("/settings/profile");
}

export async function rejectInferenceAction(inferenceId: string) {
  const userId = await requireUserId();
  await insertUserCorrection({
    userId,
    targetType: "inference",
    targetId: inferenceId,
    action: "reject",
  });
  revalidatePath("/settings/profile");
}

export async function editInferenceAction(inferenceId: string, claim: string) {
  const userId = await requireUserId();
  if (!memoryContentAllowed(claim)) throw new Error("Invalid content");
  await insertUserCorrection({
    userId,
    targetType: "inference",
    targetId: inferenceId,
    action: "edit",
    correctedContent: claim,
  });
  revalidatePath("/settings/profile");
}

export async function editMemoryNoteAction(memoryId: string, content: string) {
  const userId = await requireUserId();
  if (!memoryContentAllowed(content)) throw new Error("Invalid content");
  await updateMemoryContent(userId, memoryId, content);
  await insertUserCorrection({
    userId,
    targetType: "memory",
    targetId: memoryId,
    action: "edit",
    correctedContent: content,
  });
  revalidatePath("/settings/profile");
}

export async function rejectMemoryNoteAction(memoryId: string) {
  const userId = await requireUserId();
  await insertUserCorrection({
    userId,
    targetType: "memory",
    targetId: memoryId,
    action: "reject",
  });
  revalidatePath("/settings/profile");
}

export async function optInResearchAction() {
  const userId = await requireUserId();
  await optInPersonalizationResearch({ userId });
  revalidatePath("/settings/research");
}

export async function revokeResearchAction() {
  const userId = await requireUserId();
  await revokePersonalizationResearch(userId);
  revalidatePath("/settings/research");
}

/** @internal for admin */
export async function smeUpdateInferenceState(
  userId: string,
  inferenceId: string,
  state: Parameters<typeof updateInferenceState>[2],
  claim?: string,
) {
  return updateInferenceState(userId, inferenceId, state, claim);
}
