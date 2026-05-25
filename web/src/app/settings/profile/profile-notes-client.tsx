"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  confirmInferenceAction,
  editInferenceAction,
  editMemoryNoteAction,
  rejectInferenceAction,
  rejectMemoryNoteAction,
} from "@/app/settings/personalization-actions";
import { kindLabel, laneForInference, laneForMemory } from "@/lib/personalization/profile-utils";
import type { UserMemoryRow } from "@/lib/personalization/profile-types";
import type { UserInferenceRow } from "@/lib/personalization/inference-store";

type Lane = "confirmed" | "inferred" | "guessing";

function CoverageBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary/70 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function NoteCard({
  id,
  targetType,
  kind,
  claim,
  evidence,
  lane,
}: {
  id: string;
  targetType: "inference" | "memory";
  kind: string;
  claim: string;
  evidence?: string | null;
  lane: Lane;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(claim);
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-xl border border-border/50 bg-card/40 p-4 text-sm">
      <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wide text-muted-foreground">
        <span>{kindLabel(kind)}</span>
        {lane === "guessing" ? (
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-800 dark:text-amber-400">
            Still guessing
          </span>
        ) : null}
      </div>
      {editing ? (
        <div className="mt-2 space-y-2">
          <Input value={text} onChange={(e) => setText(e.target.value)} />
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  if (targetType === "inference") {
                    await editInferenceAction(id, text);
                  } else {
                    await editMemoryNoteAction(id, text);
                  }
                  setEditing(false);
                })
              }
            >
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-2 leading-relaxed">{claim}</p>
      )}
      {evidence ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Why: &ldquo;{evidence}&rdquo;
        </p>
      ) : null}
      {!editing ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() =>
              void run(async () => {
                if (targetType === "inference") {
                  await confirmInferenceAction(id);
                }
              })
            }
          >
            Looks right
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() =>
              void run(async () => {
                if (targetType === "inference") {
                  await rejectInferenceAction(id);
                } else {
                  await rejectMemoryNoteAction(id);
                }
              })
            }
          >
            Not really
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => setEditing(true)}
          >
            Edit
          </Button>
        </div>
      ) : null}
    </li>
  );
}

export function ProfileNotesClient({
  inferences,
  memories,
  coverage,
  workingStrip,
}: {
  inferences: UserInferenceRow[];
  memories: UserMemoryRow[];
  coverage: { communication: number; concerns: number; whatHelps: number; boundaries: number };
  workingStrip: string[];
}) {
  const inferenceCards = inferences
    .filter((i) => i.state !== "user_rejected" && i.state !== "sme_rejected")
    .map((i) => ({
      id: i.id,
      targetType: "inference" as const,
      kind: i.kind,
      claim: i.claim,
      evidence: i.evidenceSnippet,
      lane: laneForInference(i),
    }));

  const memoryCards = memories.map((m) => ({
    id: m.id,
    targetType: "memory" as const,
    kind: m.kind,
    claim: m.content,
    evidence: null as string | null,
    lane: laneForMemory(m),
  }));

  const all = [...inferenceCards, ...memoryCards];
  const lanes: { key: Lane; title: string; hint: string }[] = [
    {
      key: "confirmed",
      title: "Confirmed",
      hint: "You or a reviewer marked these as accurate.",
    },
    {
      key: "inferred",
      title: "Inferred",
      hint: "Willow noticed these from your chats — please check them.",
    },
    {
      key: "guessing",
      title: "Still guessing",
      hint: "Low confidence — Willow won't lean on these heavily.",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border/50 bg-card/30 p-4">
        <h2 className="text-sm font-medium">Profile coverage</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          What Willow knows about you so far. Empty areas are normal early on.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <CoverageBar label="Communication" value={coverage.communication} />
          <CoverageBar label="Concerns" value={coverage.concerns} />
          <CoverageBar label="What helps" value={coverage.whatHelps} />
          <CoverageBar label="Boundaries" value={coverage.boundaries} />
        </div>
      </section>

      {workingStrip.length ? (
        <section className="rounded-2xl border border-border/50 bg-card/30 p-4">
          <h2 className="text-sm font-medium">What&apos;s been working</h2>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {workingStrip.map((line) => (
              <li key={line}>• {line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {lanes.map(({ key, title, hint }) => {
        const items = all.filter((c) => c.lane === key);
        if (!items.length) return null;
        return (
          <section key={key} className="space-y-3">
            <div>
              <h2 className="text-sm font-medium">{title}</h2>
              <p className="text-xs text-muted-foreground">{hint}</p>
            </div>
            <ul className="space-y-3">
              {items.map((item) => (
                <NoteCard key={`${item.targetType}-${item.id}`} {...item} />
              ))}
            </ul>
          </section>
        );
      })}

      {!all.length ? (
        <p className="text-sm text-muted-foreground">
          Nothing here yet — chat with Willow and notes will appear as it learns
          what helps you.
        </p>
      ) : null}
    </div>
  );
}
