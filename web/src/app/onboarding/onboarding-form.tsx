"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AGE_OPTIONS = [
  { value: "18_24", label: "18–24" },
  { value: "25_34", label: "25–34" },
  { value: "35_44", label: "35–44" },
  { value: "45_54", label: "45–54" },
  { value: "55_64", label: "55–64" },
  { value: "65_plus", label: "65+" },
] as const;

export function OnboardingForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const preferredName = (
      form.elements.namedItem("preferredName") as HTMLInputElement
    ).value;
    const timezone = (form.elements.namedItem("timezone") as HTMLInputElement)
      .value;
    const ageBand = (form.elements.namedItem("ageBand") as HTMLSelectElement)
      .value;
    const presentingConcerns = (
      form.elements.namedItem("presentingConcerns") as HTMLTextAreaElement
    ).value;
    const consent = (form.elements.namedItem("consent") as HTMLInputElement)
      .checked;

    if (!consent) {
      setPending(false);
      setError("Please confirm consent to continue.");
      return;
    }

    const res = await fetch("/api/me/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        preferredName,
        timezone: timezone || undefined,
        ageBand,
        presentingConcerns: presentingConcerns || undefined,
        consentVersion: "cbt-v1",
      }),
    });
    const data = (await res.json()) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save");
      return;
    }
    router.push("/chat");
    router.refresh();
  }

  return (
    <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="preferredName">Preferred name</Label>
        <Input id="preferredName" name="preferredName" required maxLength={120} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone (optional)</Label>
        <Input
          id="timezone"
          name="timezone"
          placeholder="e.g. America/Denver"
          maxLength={80}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ageBand">Age band</Label>
        <select
          id="ageBand"
          name="ageBand"
          required
          className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
        >
          <option value="">Select…</option>
          {AGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="presentingConcerns">
          What brings you here? (optional)
        </Label>
        <textarea
          id="presentingConcerns"
          name="presentingConcerns"
          rows={3}
          maxLength={2000}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
        />
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="consent" className="mt-1" />
        <span>
          I am 18 or older. I understand this tool is not therapy or emergency
          care. I consent to mood and exercise data being stored with my account
          until I delete it.
        </span>
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Continue to chat"}
      </Button>
    </form>
  );
}
