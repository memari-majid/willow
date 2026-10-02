import Link from "next/link";

import { Chat } from "@/components/chat/chat";
import { SafetyDisclaimer } from "@/components/chat/safety-disclaimer";
import { WillowMark } from "@/components/willow-mark";
import { loadContent } from "@/lib/content";

export default async function DemoPage() {
  const content = await loadContent();
  return (
    <main className="mx-auto flex h-dvh w-full max-w-5xl flex-col gap-3 px-4 py-4 sm:px-6">
      <header className="flex items-center justify-between gap-3">
        <Link href="/" aria-label="Willow home"><WillowMark /></Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/wiki">Library</Link>
          <Link href="/sources">How it works</Link>
        </nav>
      </header>
      <p className="text-center text-xs text-muted-foreground">
        Public demo · No account needed · This conversation clears when you refresh.
      </p>
      <SafetyDisclaimer />
      <div className="min-h-0 flex-1">
        <Chat demo starters={content.starters} />
      </div>
    </main>
  );
}
