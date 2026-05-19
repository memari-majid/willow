import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WillowMark } from "@/components/willow-mark";

import { getSettingsSnapshot, updatePreferencesAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const { user, prefs } = await getSettingsSnapshot();

  return (
    <div className="mx-auto min-h-[100svh] w-full max-w-lg px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/chat">
          <WillowMark />
        </Link>
        <nav className="flex gap-3 text-xs">
          <Link href="/settings/memory" className="underline-offset-4 hover:underline">
            Memory
          </Link>
          <Link href="/settings/data" className="underline-offset-4 hover:underline">
            Data
          </Link>
        </nav>
      </header>

      <h1 className="text-lg font-medium">Preferences</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        How Willow communicates with you. Changes apply on your next message.
      </p>

      <form action={updatePreferencesAction} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="preferredName">Preferred name</Label>
          <Input
            id="preferredName"
            name="preferredName"
            defaultValue={user?.preferredName ?? ""}
            maxLength={120}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="preferredPronouns">Pronouns</Label>
          <Input
            id="preferredPronouns"
            name="preferredPronouns"
            defaultValue={prefs?.preferredPronouns ?? ""}
            placeholder="e.g. she/her"
            maxLength={40}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="formality">Formality</Label>
          <select
            id="formality"
            name="formality"
            defaultValue={prefs?.formality ?? ""}
            className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
          >
            <option value="">Default</option>
            <option value="casual">Casual</option>
            <option value="neutral">Neutral</option>
            <option value="formal">Formal</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="directness">Directness (1–5)</Label>
          <Input
            id="directness"
            name="directness"
            type="number"
            min={1}
            max={5}
            defaultValue={prefs?.directness ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pace">Pace</Label>
          <select
            id="pace"
            name="pace"
            defaultValue={prefs?.pace ?? ""}
            className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
          >
            <option value="">Default</option>
            <option value="slow">Slow</option>
            <option value="default">Default</option>
            <option value="brisk">Brisk</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Language code</Label>
          <Input
            id="language"
            name="language"
            defaultValue={prefs?.language ?? "en"}
            placeholder="en, es, fr"
            maxLength={10}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="avoidList">Topics to avoid (comma-separated)</Label>
          <Input
            id="avoidList"
            name="avoidList"
            defaultValue={prefs?.avoidList?.join(", ") ?? ""}
            placeholder="e.g. my ex, work gossip"
          />
        </div>
        <Button type="submit">Save preferences</Button>
      </form>
    </div>
  );
}
