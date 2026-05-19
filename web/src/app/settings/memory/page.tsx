import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { WillowMark } from "@/components/willow-mark";
import { listUserMemories } from "@/lib/memory/store";

import {
  deleteMemoryAction,
  forgetAllMemoriesAction,
  pinMemoryAction,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function SettingsMemoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const memories = await listUserMemories(session.user.id, 200);

  return (
    <div className="mx-auto min-h-[100svh] w-full max-w-2xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/chat">
          <WillowMark />
        </Link>
        <nav className="flex gap-3 text-xs">
          <Link href="/settings" className="underline-offset-4 hover:underline">
            Preferences
          </Link>
          <Link href="/settings/data" className="underline-offset-4 hover:underline">
            Data
          </Link>
        </nav>
      </header>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-medium">Memory</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Facts and preference notes Willow uses across conversations. Pinned
            items never expire.
          </p>
        </div>
        <form action={forgetAllMemoriesAction}>
          <Button type="submit" variant="outline" size="sm">
            Forget everything
          </Button>
        </form>
      </div>

      <ul className="mt-6 space-y-3">
        {memories.length === 0 ? (
          <li className="text-sm text-muted-foreground">No memories stored yet.</li>
        ) : (
          memories.map((m) => (
            <li
              key={m.id}
              className="rounded-xl border border-border/50 bg-card/40 p-4 text-sm"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded bg-muted px-1.5 py-0.5">{m.kind}</span>
                <span>{m.source}</span>
                {m.pinned ? (
                  <span className="text-primary">pinned</span>
                ) : null}
                {m.content.startsWith("[proposed]") ? (
                  <span className="text-amber-600">proposed — accept in prefs</span>
                ) : null}
              </div>
              <p className="mt-2 whitespace-pre-wrap">{m.content}</p>
              <div className="mt-3 flex gap-2">
                <form action={pinMemoryAction}>
                  <input type="hidden" name="memoryId" value={m.id} />
                  <input
                    type="hidden"
                    name="pinned"
                    value={m.pinned ? "false" : "true"}
                  />
                  <Button type="submit" variant="outline" size="sm">
                    {m.pinned ? "Unpin" : "Pin"}
                  </Button>
                </form>
                <form action={deleteMemoryAction}>
                  <input type="hidden" name="memoryId" value={m.id} />
                  <Button type="submit" variant="outline" size="sm">
                    Delete
                  </Button>
                </form>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
