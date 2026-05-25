import Link from "next/link";
import { redirect } from "next/navigation";

import { smeCorrectionAction } from "@/app/admin/personalization/actions";
import { AdminNav } from "@/app/admin/admin-nav";
import { auth } from "@/auth";
import { isAdminUser } from "@/lib/admin";
import {
  anonymizeUserLabel,
  listOptedInUserIds,
} from "@/lib/personalization/consent-store";
import { listInferencesForOptedInUsers } from "@/lib/personalization/inference-store";
import { listUserMemories } from "@/lib/memory/store";
import { scrubEvidenceForSme } from "@/lib/personalization/scrub-evidence";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function AdminPersonalizationPage() {
  const session = await auth();
  if (!session?.user?.email || !isAdminUser(session.user.email)) {
    redirect("/sign-in");
  }

  const optedInIds = await listOptedInUserIds();
  const inferences = await listInferencesForOptedInUsers(optedInIds);
  const pending = inferences.filter((i) => i.state === "pending");

  const rejectCounts: Record<string, number> = {};
  for (const inf of inferences) {
    if (inf.state === "sme_rejected" || inf.state === "user_rejected") {
      rejectCounts[inf.kind] = (rejectCounts[inf.kind] ?? 0) + 1;
    }
  }

  const memoriesByUser = new Map<string, Awaited<ReturnType<typeof listUserMemories>>>();
  for (const uid of optedInIds.slice(0, 20)) {
    memoriesByUser.set(uid, await listUserMemories(uid, 30));
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Personalization review</h1>
        <Link href="/chat" className="text-sm text-muted-foreground hover:underline">
          Back to chat
        </Link>
      </div>
      <AdminNav current="/admin/personalization" />
      <p className="text-sm text-muted-foreground">
        Opt-in cohort only ({optedInIds.length} participants). Evidence is
        scrubbed before display.
      </p>

      {Object.keys(rejectCounts).length ? (
        <div className="rounded-lg border border-border/60 p-4 text-sm">
          <p className="font-medium">Top rejected inference kinds</p>
          <ul className="mt-2 text-xs text-muted-foreground">
            {Object.entries(rejectCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([kind, n]) => (
                <li key={kind}>
                  {kind}: {n}
                </li>
              ))}
          </ul>
        </div>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-sm font-medium">Pending inferences</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing pending.</p>
        ) : (
          <ul className="space-y-4">
            {pending.map((inf) => (
              <li
                key={inf.id}
                className="rounded-lg border border-border/60 p-4 text-sm"
              >
                <p className="text-xs text-muted-foreground">
                  {anonymizeUserLabel(inf.userId)} · {inf.kind} ·{" "}
                  {inf.confidence}
                </p>
                <p className="mt-2 font-medium">{inf.claim}</p>
                {inf.evidenceSnippet ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Evidence: {scrubEvidenceForSme(inf.evidenceSnippet)}
                  </p>
                ) : null}
                <SmeActionForms
                  userId={inf.userId}
                  targetType="inference"
                  targetId={inf.id}
                  originalContent={inf.claim}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium">Recent memories (opt-in)</h2>
        <ul className="space-y-4">
          {optedInIds.slice(0, 10).flatMap((uid) => {
            const mems = (memoriesByUser.get(uid) ?? []).slice(0, 5);
            return mems.map((m) => (
              <li
                key={m.id}
                className="rounded-lg border border-border/60 p-4 text-sm"
              >
                <p className="text-xs text-muted-foreground">
                  {anonymizeUserLabel(uid)} · {m.kind} · {m.source}
                </p>
                <p className="mt-2">{scrubEvidenceForSme(m.content)}</p>
                <SmeActionForms
                  userId={uid}
                  targetType="memory"
                  targetId={m.id}
                  originalContent={m.content}
                />
              </li>
            ));
          })}
        </ul>
      </section>
    </div>
  );
}

function SmeActionForms({
  userId,
  targetType,
  targetId,
  originalContent,
}: {
  userId: string;
  targetType: "inference" | "memory";
  targetId: string;
  originalContent: string;
}) {
  return (
    <div className="mt-4 space-y-3 border-t border-border/40 pt-3">
      <form action={smeCorrectionAction} className="flex flex-wrap gap-2">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="targetType" value={targetType} />
        <input type="hidden" name="targetId" value={targetId} />
        <input type="hidden" name="originalContent" value={originalContent} />
        <input type="hidden" name="action" value="accept" />
        <Button type="submit" size="sm" variant="outline">
          Accept
        </Button>
      </form>
      <form action={smeCorrectionAction} className="flex flex-wrap gap-2">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="targetType" value={targetType} />
        <input type="hidden" name="targetId" value={targetId} />
        <input type="hidden" name="originalContent" value={originalContent} />
        <input type="hidden" name="action" value="reject" />
        <select
          name="reasonCode"
          className="h-8 rounded-lg border border-input bg-transparent px-2 text-xs"
          defaultValue="overreach"
        >
          <option value="overreach">Overreach</option>
          <option value="wrong_evidence">Wrong evidence</option>
          <option value="privacy_sensitive">Privacy sensitive</option>
          <option value="clinical_misread">Clinical misread</option>
        </select>
        <Button type="submit" size="sm" variant="ghost">
          Reject
        </Button>
      </form>
      <form action={smeCorrectionAction} className="flex flex-col gap-2">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="targetType" value={targetType} />
        <input type="hidden" name="targetId" value={targetId} />
        <input type="hidden" name="originalContent" value={originalContent} />
        <input type="hidden" name="action" value="edit" />
        <Input
          name="correctedContent"
          placeholder="Corrected text"
          defaultValue={originalContent}
          className="text-sm"
        />
        <Button type="submit" size="sm" variant="secondary">
          Save edit
        </Button>
      </form>
      <form action={smeCorrectionAction} className="flex flex-col gap-2">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="targetType" value={targetType} />
        <input type="hidden" name="targetId" value={targetId} />
        <input type="hidden" name="originalContent" value={originalContent} />
        <input type="hidden" name="action" value="counter_example" />
        <Input
          name="correctedContent"
          placeholder='Micro-example: If user says X, do Y not Z'
          className="text-sm"
        />
        <Button type="submit" size="sm">
          Add counter-example
        </Button>
      </form>
    </div>
  );
}
