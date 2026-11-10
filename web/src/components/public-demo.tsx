"use client";

import { useState } from "react";
import type { PublicExample } from "@/lib/public-demo/catalog";

type Entry = { exampleId: string; label: string; reply: string };
export function PublicDemo({ title, subtitle, scope, examples, sources }: {
  title: string; subtitle: string; scope: string; examples: PublicExample[];
  sources: { label: string; url: string }[];
}) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function choose(example: PublicExample) {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/demo/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exampleId: example.id }), cache: "no-store",
        credentials: "omit",
      });
      const result = await response.json();
      if (!response.ok || typeof result.reply !== "string") throw new Error("unavailable");
      setEntries((current) => [...current.slice(-5), { exampleId: example.id, label: example.label, reply: result.reply }]);
    } catch { setError("This example could not load. Please try again in a moment."); }
    finally { setBusy(false); }
  }
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10 sm:px-8">
      <p className="mb-3 text-sm font-semibold text-primary">Demo · use fictional examples</p>
      <h1 className="text-4xl leading-tight sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{subtitle}</p>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">Choose a sample below. No sign-in or personal details needed. Examples stay in this page until you clear or refresh it.</p>
      <p className="mt-2 text-sm text-muted-foreground">{scope}</p>
      <section aria-label="Fictional examples" className="my-8 grid gap-3 sm:grid-cols-3">
        {examples.map((example) => <button key={example.id} type="button" disabled={busy} onClick={() => choose(example)} className="rounded-2xl border border-border bg-card p-5 text-left font-medium text-foreground shadow-sm transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50">{example.label}<span aria-hidden className="mt-3 block text-primary">Explore →</span></button>)}
      </section>
      <div aria-live="polite" aria-busy={busy} className="space-y-5">
        {entries.map((entry, index) => <article key={index} className="rounded-2xl border border-border bg-card p-6"><h2 className="mb-3 text-xl">{entry.label}</h2><div className="space-y-3 text-sm leading-relaxed [&_p]:mb-3 [&_li]:mb-1 [&_a]:text-primary [&_a]:underline"><p className="whitespace-pre-wrap">{entry.reply}</p></div></article>)}
        {busy ? <p className="text-sm text-muted-foreground" role="status">Exploring this fictional example…</p> : null}
        {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
      </div>
      {entries.length ? <button type="button" onClick={() => { setEntries([]); setError(""); }} disabled={busy} className="mt-5 rounded-lg border border-border bg-card px-4 py-2 text-sm">Clear examples</button> : null}
      {sources.length ? <aside className="mt-10 border-t border-border pt-5"><h2 className="text-lg">Public reading</h2><ul className="mt-3 space-y-2 text-sm">{sources.map((source) => <li key={source.url}><a className="text-primary underline underline-offset-4" href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a></li>)}</ul></aside> : null}
    </main>
  );
}
