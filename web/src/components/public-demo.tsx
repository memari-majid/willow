"use client";

import { useEffect, useRef, useState } from "react";
import type { PublicExample, PublicGuide } from "@/lib/public-demo/catalog";

export function splitClassroomReply(reply: string) {
  const match = /(?:^|\n)\s*(?:Teacher(?:’s|'s)?\s+)?(?:reflection|feedback)\s*:\s*/i.exec(reply);
  if (!match || match.index === 0) return null;
  return {
    studentResponses: reply.slice(0, match.index).trim(),
    teacherFeedback: reply.slice(match.index + match[0].length).trim(),
  };
}

export function PublicDemo({ title, subtitle, scope, examples, sources, guide }: {
  title: string; subtitle: string; scope: string; examples: PublicExample[];
  sources: { label: string; url: string }[]; guide: PublicGuide;
}) {
  const [selectedId, setSelectedId] = useState(examples[0].id);
  const [reply, setReply] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const exampleHeading = useRef<HTMLHeadingElement>(null);
  const selected = examples.find((example) => example.id === selectedId) ?? examples[0];
  const step = busy ? 2 : reply ? 3 : 1;
  const classroom = guide.responseMode === "classroom" && reply ? splitClassroomReply(reply) : null;

  useEffect(() => {
    if (reply) resultHeading.current?.focus();
  }, [reply]);

  function choose(id: string) {
    if (pending.current || !examples.some((example) => example.id === id)) return;
    setSelectedId(id); setReply(null); setError("");
  }
  function reset() {
    if (pending.current) return;
    choose(examples[0].id);
    exampleHeading.current?.focus();
  }
  function tryAnother() {
    const next = (examples.findIndex((example) => example.id === selected.id) + 1) % examples.length;
    choose(examples[next].id);
    exampleHeading.current?.focus();
  }
  async function start() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true); setReply(null); setError("");
    try {
      const response = await fetch("/api/demo/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exampleId: selected.id }), cache: "no-store", credentials: "omit",
      });
      const result = await response.json();
      if (!response.ok || typeof result.reply !== "string" || !result.reply.trim()) throw new Error("unavailable");
      setReply(result.reply);
    } catch { setError("This example could not load. Try this example again in a moment."); }
    finally { pending.current = false; setBusy(false); }
  }
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:px-8">
      <p className="mb-3 text-sm font-semibold text-primary">Demo · use fictional examples</p>
      <h1 className="text-4xl leading-tight sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{subtitle}</p>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">Follow one example in three steps. No sign-in or personal details needed. Your result clears when you reset or refresh.</p>
      <p className="mt-2 text-sm text-muted-foreground">{scope}</p>

      <ol aria-label="Guided demo steps" className="my-8 grid gap-2 sm:grid-cols-3">
        {guide.steps.map((label, index) => <li key={label} aria-current={step === index + 1 ? "step" : undefined} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${step === index + 1 ? "border-primary bg-accent text-accent-foreground" : "border-border bg-card text-muted-foreground"}`}><span aria-hidden className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${step > index + 1 ? "bg-primary text-primary-foreground" : "border border-current"}`}>{step > index + 1 ? "✓" : index + 1}</span><span>{label}</span></li>)}
      </ol>

      <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.2fr]">
        <section aria-labelledby="demo-example-heading" className="rounded-2xl border border-border bg-card p-6 sm:p-7">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">Step 1 · The sample</p>
          <h2 ref={exampleHeading} id="demo-example-heading" tabIndex={-1} className="text-2xl outline-none">{selected.label}</h2>
          {selected.id === examples[0].id ? <p className="mt-2 text-xs font-medium text-primary">Recommended first example</p> : null}
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{selected.context}</p>
          <div className="mt-5 rounded-xl border border-border bg-background p-4">
            <h3 className="text-sm font-semibold">{guide.inputLabel}</h3>
            <p className="mt-2 text-sm leading-relaxed">{selected.sampleInput}</p>
          </div>
          <button type="button" disabled={busy} onClick={() => void start()} className={`mt-6 w-full rounded-xl px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-wait disabled:opacity-60 ${reply ? "border border-border bg-card text-primary" : "bg-primary text-primary-foreground hover:opacity-90"}`}>{busy ? "Generating the example…" : error ? "Try this example again" : reply ? "Run this example again" : "Start guided demo →"}</button>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">This runs only the selected sample. You do not need to type or upload anything.</p>
          <div className="mt-6 border-t border-border pt-5">
            <label htmlFor="demo-example" className="mb-2 block text-sm font-medium">Or choose another example</label>
            <select id="demo-example" value={selected.id} disabled={busy} onChange={(event) => choose(event.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-60">{examples.map((example) => <option key={example.id} value={example.id}>{example.label}</option>)}</select>
            <button type="button" onClick={reset} disabled={busy || (selected.id === examples[0].id && !reply && !error)} className="mt-3 rounded-lg border border-border px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-40">Reset demo</button>
          </div>
        </section>

        <section aria-labelledby="demo-result-heading" aria-busy={busy} className="min-w-0 rounded-2xl border border-border bg-card p-6 sm:p-7">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">{reply ? "Step 3 · Read the result" : "Step 2 · See what happens"}</p>
          <h2 ref={resultHeading} id="demo-result-heading" tabIndex={-1} className="text-2xl outline-none">{guide.responseLabel}</h2>
          <p role="status" aria-live="polite" className="mt-3 text-sm leading-relaxed text-muted-foreground">{busy ? guide.waiting : reply ? "Your example is ready. Read the response, then use the guidance below." : "Start the guided demo to see a live response to the sample shown alongside."}</p>
          {reply ? <>
            <div className="mt-6 space-y-5 text-sm leading-relaxed">
              {classroom ? <><section aria-label="Fictional student responses"><h3 className="mb-2 text-base font-semibold">Student responses</h3><p className="whitespace-pre-wrap">{classroom.studentResponses}</p></section><section aria-label="Teacher feedback" className="border-t border-border pt-4"><h3 className="mb-2 text-base font-semibold">Teacher feedback</h3><p className="whitespace-pre-wrap">{classroom.teacherFeedback}</p></section></> : <p className="whitespace-pre-wrap">{reply}</p>}
            </div>
            <aside aria-label="How to read this result" className="mt-6 rounded-xl border border-primary/20 bg-accent p-5 text-sm leading-relaxed text-accent-foreground">
              <h3 className="text-base font-semibold">What to notice</h3><p className="mt-2">{selected.takeaway}</p>
              <p className="mt-3 font-medium">Your next step</p><p className="mt-1">{selected.nextAction}</p>
            </aside>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button type="button" onClick={tryAnother} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-ring">Try another example →</button>
              {sources.length ? <a href="#public-demo-sources" className="text-sm font-medium text-primary underline underline-offset-4">{guide.nextLabel}</a> : null}
            </div>
          </> : <div className="mt-6 rounded-xl border border-dashed border-border bg-background p-5 text-sm leading-relaxed text-muted-foreground"><h3 className="mb-2 text-base font-semibold text-foreground">How to read the result</h3><p>{guide.readingGuide}</p></div>}
          {error ? <p role="alert" className="mt-5 rounded-lg border border-destructive/30 p-3 text-sm text-destructive">{error}</p> : null}
        </section>
      </div>
      {sources.length ? <aside id="public-demo-sources" className="mt-10 scroll-mt-6 border-t border-border pt-5"><h2 className="text-xl">Public sources for this demo</h2><p className="mt-2 text-sm text-muted-foreground">Use these public pages to read further and check the explanation.</p><ul className="mt-3 space-y-2 text-sm">{sources.map((source) => <li key={source.url}><a className="text-primary underline underline-offset-4" href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a></li>)}</ul></aside> : null}
    </main>
  );
}
