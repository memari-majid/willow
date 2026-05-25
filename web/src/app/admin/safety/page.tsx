import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { MarkReviewedForm } from "@/app/admin/safety/mark-reviewed-form";
import { AdminNav } from "@/app/admin/admin-nav";
import { isAdminUser } from "@/lib/admin";
import { listPendingSafetyEvents } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function AdminSafetyPage() {
  const session = await auth();
  if (!session?.user?.email || !isAdminUser(session.user.email)) {
    redirect("/sign-in");
  }

  const events = await listPendingSafetyEvents(200);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Safety event review</h1>
        <Link href="/chat" className="text-sm text-muted-foreground hover:underline">
          Back to chat
        </Link>
      </div>
      <AdminNav current="/admin/safety" />
      <p className="text-sm text-muted-foreground">
        Yellow and red classifier events awaiting human review (clinical audit).
      </p>
      <ul className="space-y-4">
        {events.map((e) => (
          <li
            key={e.id}
            className="rounded-lg border border-border/60 p-4 text-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium capitalize">{e.riskLevel}</span>
              <span className="text-xs text-muted-foreground">
                {e.createdAt?.toISOString?.() ?? ""}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              User: {e.userId ?? "—"} · Conv: {e.conversationId ?? "—"}
            </p>
            <p className="mt-1">
              {(e.indicators ?? []).join(", ") || "(no indicators)"}
            </p>
            <div className="mt-3">
              <MarkReviewedForm eventId={e.id} />
            </div>
          </li>
        ))}
      </ul>
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No pending events.</p>
      ) : null}
    </div>
  );
}
