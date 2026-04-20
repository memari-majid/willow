"use client";

import { useEffect, useMemo, useState } from "react";
import { Cpu } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type CuratedModel = {
  id: string;
  name: string;
  description?: string;
  contextWindow?: number;
  pricing?: { input: string; output: string };
};

export type CuratedProvider = {
  id: string;
  name: string;
  models: CuratedModel[];
};

const STORAGE_KEY = "willow.model";

/**
 * The default the picker falls back to when localStorage is empty.
 * Mirrors `PRIMARY_MODEL` in `src/lib/ai/model.ts`. If the developer
 * changes the primary, also change this string so the picker
 * reflects it.
 */
export const DEFAULT_MODEL_ID = "openai/gpt-5.4";

/**
 * Reads + writes the SME's model choice to localStorage so it
 * survives across sessions on their browser.
 */
export function useModelChoice(): [string, (id: string) => void] {
  const [model, setModelState] = useState<string>(DEFAULT_MODEL_ID);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setModelState(stored);
  }, []);

  function setModel(id: string) {
    setModelState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }

  return [model, setModel];
}

/**
 * Compact model picker for the SME dashboard. Fetches the curated
 * provider list from `/api/models` once on mount, persists the
 * choice to localStorage, and emits an `onChange` so the parent can
 * pass the model id into useChat's transport body.
 */
export function ModelPicker({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  const [providers, setProviders] = useState<CuratedProvider[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/models")
      .then((r) => r.json() as Promise<{ providers: CuratedProvider[] }>)
      .then((d) => {
        if (!cancelled) setProviders(d.providers);
      })
      .catch(() => {
        if (!cancelled) setProviders([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const flatModels = useMemo(
    () => (providers ?? []).flatMap((p) => p.models),
    [providers],
  );
  const current = flatModels.find((m) => m.id === value);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Cpu className="size-3.5 shrink-0 text-muted-foreground" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          size="sm"
          className="h-8 max-w-[260px] rounded-full border-border/60 bg-card/40 text-xs"
          aria-label="Select model"
        >
          <SelectValue placeholder={value} />
        </SelectTrigger>
        <SelectContent className="max-h-[420px]">
          {providers === null ? (
            <SelectItem value={value} disabled>
              Loading models…
            </SelectItem>
          ) : providers.length === 0 ? (
            <SelectItem value={value} disabled>
              {value} (gateway unreachable)
            </SelectItem>
          ) : (
            providers.map((p) => (
              <SelectGroup key={p.id}>
                <SelectLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {p.name}
                </SelectLabel>
                {p.models.map((m) => (
                  <SelectItem key={m.id} value={m.id} className="text-xs">
                    <span className="font-medium">{m.name}</span>
                    <span className="ml-2 text-[10px] text-muted-foreground">
                      {m.id}
                    </span>
                  </SelectItem>
                ))}
              </SelectGroup>
            ))
          )}
        </SelectContent>
      </Select>
      {current?.pricing && (
        <span
          className="hidden text-[10px] text-muted-foreground sm:inline"
          title={`Input $${current.pricing.input}/tok · Output $${current.pricing.output}/tok`}
        >
          ${pricePerMTokens(current.pricing.input)}/M in · $
          {pricePerMTokens(current.pricing.output)}/M out
        </span>
      )}
    </div>
  );
}

function pricePerMTokens(perToken: string): string {
  const n = Number(perToken);
  if (Number.isNaN(n)) return "?";
  const perMillion = n * 1_000_000;
  return perMillion < 1
    ? perMillion.toFixed(2)
    : perMillion < 10
      ? perMillion.toFixed(1)
      : perMillion.toFixed(0);
}
