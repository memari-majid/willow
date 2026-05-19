"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { auth, signOut } from "@/auth";
import { getUserById } from "@/lib/db/queries";
import {
  deleteUserAccount,
  exportUserData,
  forgetAllMemories,
  forgetMemory,
  getUserPreferences,
  setMemoryPinned,
  upsertUserPreference,
} from "@/lib/memory/store";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function updatePreferencesAction(formData: FormData) {
  const userId = await requireUserId();
  const preferredName = String(formData.get("preferredName") ?? "").trim();
  const preferredPronouns = String(formData.get("preferredPronouns") ?? "").trim();
  const formality = String(formData.get("formality") ?? "").trim() || null;
  const pace = String(formData.get("pace") ?? "").trim() || null;
  const language = String(formData.get("language") ?? "").trim() || null;
  const directnessRaw = String(formData.get("directness") ?? "");
  const directness = directnessRaw ? Number.parseInt(directnessRaw, 10) : null;
  const avoidRaw = String(formData.get("avoidList") ?? "");
  const avoidList = avoidRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (preferredName) {
    await db
      .update(users)
      .set({ preferredName })
      .where(eq(users.id, userId));
  }

  await upsertUserPreference(userId, {
    preferredPronouns: preferredPronouns || null,
    formality,
    pace,
    language,
    directness: Number.isFinite(directness) ? directness : null,
    avoidList: avoidList.length ? avoidList : null,
  });

  revalidatePath("/settings");
}

export async function pinMemoryAction(formData: FormData) {
  const userId = await requireUserId();
  const memoryId = String(formData.get("memoryId") ?? "");
  const pinned = formData.get("pinned") === "true";
  if (!memoryId) return;
  await setMemoryPinned(userId, memoryId, pinned);
  revalidatePath("/settings/memory");
}

export async function deleteMemoryAction(formData: FormData) {
  const userId = await requireUserId();
  const memoryId = String(formData.get("memoryId") ?? "");
  if (!memoryId) return;
  await forgetMemory(userId, memoryId);
  revalidatePath("/settings/memory");
}

export async function forgetAllMemoriesAction() {
  const userId = await requireUserId();
  await forgetAllMemories(userId);
  revalidatePath("/settings/memory");
}

export async function exportDataAction(): Promise<string> {
  const userId = await requireUserId();
  const data = await exportUserData(userId);
  return JSON.stringify(data, null, 2);
}

export async function deleteAccountAction() {
  const userId = await requireUserId();
  await deleteUserAccount(userId);
  await signOut({ redirect: false });
  redirect("/");
}

export async function getSettingsSnapshot() {
  const userId = await requireUserId();
  const [user, prefs] = await Promise.all([
    getUserById(userId),
    getUserPreferences(userId),
  ]);
  return { user, prefs };
}
