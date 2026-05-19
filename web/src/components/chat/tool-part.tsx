import { isToolUIPart } from "ai";
import type { ReactNode } from "react";

import type { WillowUIMessage } from "@/lib/ai/message-metadata";
import { cn } from "@/lib/utils";

type ToolPart = Extract<
  WillowUIMessage["parts"][number],
  { type: string }
> & {
  type: string;
  state?: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

function toolDisplayName(part: ToolPart): string {
  if (part.type === "dynamic-tool" && "toolName" in part) {
    return String((part as { toolName?: string }).toolName ?? "tool");
  }
  if (part.type.startsWith("tool-")) return part.type.slice("tool-".length);
  return "tool";
}

function ToolCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mt-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-3 py-2 text-xs",
      )}
    >
      <div className="mb-1 font-semibold capitalize text-primary">{title}</div>
      <div className="space-y-1 text-muted-foreground">{children}</div>
    </div>
  );
}

function renderOutput(name: string, output: unknown, input?: unknown) {
  const inp =
    input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  if (!output || typeof output !== "object") {
    return <pre className="whitespace-pre-wrap">{JSON.stringify(output)}</pre>;
  }
  const o = output as Record<string, unknown>;

  switch (name) {
    case "mood_check": {
      const emotion =
        inp.emotion === "other"
          ? String(inp.emotionLabel ?? "")
          : String(inp.emotion ?? "");
      const rating = inp.rating as number | undefined;
      return (
        <>
          <div>
            Mood saved — rating {rating ?? "—"}/10 ({emotion || "—"})
          </div>
          {inp.notes ? (
            <div className="italic">{String(inp.notes)}</div>
          ) : null}
        </>
      );
    }
    case "thought_record":
      return (
        <>
          <div>Thought record completed</div>
          {o.id ? (
            <div className="font-mono text-[10px]">id: {String(o.id)}</div>
          ) : null}
        </>
      );
    case "safety_plan":
      return (
        <>
          <div>Safety plan saved</div>
          {o.planUrl ? (
            <div className="text-[11px] text-primary">{String(o.planUrl)}</div>
          ) : null}
        </>
      );
    case "behavioral_activation":
      return (
        <div>
          Activity scheduled — predicted mood{" "}
          {String(inp.moodPrediction ?? o.moodPrediction ?? "—")}/10
        </div>
      );
    case "homework_assign":
      return (
        <div>
          Homework assigned (confidence{" "}
          {String(inp.confidenceRating ?? o.confidenceRating ?? "—")}/10)
        </div>
      );
    case "homework_review":
      return <div>Homework reviewed — {String(o.status ?? "")}</div>;
    case "crisis_escalate":
      return (
        <div className="space-y-1 text-destructive">
          <div className="font-medium">Crisis resources</div>
          <ul className="list-inside list-disc">
            {(o.resources as { us?: string[] })?.us?.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      );
    case "remember_fact":
      return o.ok === false ? (
        <div className="text-destructive">{String(o.error ?? "Not saved")}</div>
      ) : (
        <div>
          Willow saved: {String(inp.content ?? o.content ?? "")}
          {o.id ? (
            <div className="font-mono text-[10px] opacity-70">
              id: {String(o.id)}
            </div>
          ) : null}
        </div>
      );
    case "update_preference":
      return o.ok === false ? (
        <div className="text-destructive">{String(o.error ?? "Not updated")}</div>
      ) : (
        <div>Preference updated — {String(inp.key ?? o.key ?? "")}</div>
      );
    case "forget_fact":
      return o.ok === false ? (
        <div className="text-destructive">{String(o.error ?? "Not removed")}</div>
      ) : (
        <div>Memory forgotten</div>
      );
    case "propose_preference_update":
      return (
        <div>
          Proposed preference change — review in{" "}
          <span className="text-primary">Settings → Memory</span>
        </div>
      );
    default:
      return (
        <pre className="max-h-40 overflow-auto whitespace-pre-wrap text-[10px]">
          {JSON.stringify(o, null, 2)}
        </pre>
      );
  }
}

/**
 * Renders AI SDK v6 tool invocation parts as compact “widgets”.
 */
export function ChatToolPart({ part }: { part: WillowUIMessage["parts"][number] }) {
  if (!isToolUIPart(part)) return null;

  const p = part as ToolPart;
  const name = toolDisplayName(p);
  const label = name.replace(/_/g, " ");

  if (p.state === "input-streaming" || p.state === "input-available") {
    return (
      <ToolCard title={label}>
        <div className="animate-pulse text-muted-foreground">Working…</div>
      </ToolCard>
    );
  }

  if (p.state === "output-error") {
    return (
      <ToolCard title={label}>
        <div className="text-destructive">{p.errorText ?? "Tool error"}</div>
      </ToolCard>
    );
  }

  if (p.state === "output-available") {
    return (
      <ToolCard title={label}>
        {renderOutput(name, p.output, p.input)}
      </ToolCard>
    );
  }

  return (
    <ToolCard title={label}>
      <div className="text-muted-foreground">…</div>
    </ToolCard>
  );
}
