"use server";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { isAdminUser } from "@/lib/admin";
import { markSafetyEventReviewed } from "@/lib/db/queries";

export async function markSafetyReviewedAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email || !isAdminUser(session.user.email)) {
    throw new Error("Forbidden");
  }
  const id = formData.get("id") as string;
  if (!id) return;
  await markSafetyEventReviewed(id);
  redirect("/admin/safety");
}
