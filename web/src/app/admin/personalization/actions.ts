"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { isAdminUser } from "@/lib/admin";
import {
  applyInferenceCorrection,
  applyMemoryCorrection,
  insertSmeCorrection,
  type CorrectionAction,
  type ReasonCode,
} from "@/lib/personalization/corrections-store";

async function requireSmeId() {
  const session = await auth();
  if (!session?.user?.email || !isAdminUser(session.user.email)) {
    throw new Error("Forbidden");
  }
  return session.user.email;
}

export async function smeCorrectionAction(formData: FormData) {
  const smeId = await requireSmeId();
  const userId = String(formData.get("userId") ?? "");
  const targetType = String(formData.get("targetType") ?? "") as
    | "inference"
    | "memory";
  const targetId = String(formData.get("targetId") ?? "");
  const action = String(formData.get("action") ?? "") as CorrectionAction;
  const originalContent = String(formData.get("originalContent") ?? "") || null;
  const correctedContent =
    String(formData.get("correctedContent") ?? "") || null;
  const rationale = String(formData.get("rationale") ?? "") || null;
  const reasonCode = (String(formData.get("reasonCode") ?? "") ||
    null) as ReasonCode | null;

  if (!userId || !targetType || !targetId || !action) {
    throw new Error("Missing fields");
  }

  await insertSmeCorrection({
    userId,
    targetType,
    targetId,
    action,
    originalContent,
    correctedContent,
    rationale,
    reasonCode,
    smeId,
  });

  if (targetType === "inference") {
    await applyInferenceCorrection({
      userId,
      inferenceId: targetId,
      action,
      correctedContent: correctedContent ?? undefined,
      reasonCode: reasonCode ?? undefined,
    });
  } else {
    await applyMemoryCorrection({
      userId,
      memoryId: targetId,
      action,
      correctedContent: correctedContent ?? undefined,
    });
  }

  revalidatePath("/admin/personalization");
}
