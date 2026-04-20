import Link from "next/link";

import { Chat } from "@/components/chat";
import { SafetyDisclaimer } from "@/components/safety-disclaimer";
import { WillowMark } from "@/components/willow-mark";
import { loadContent } from "@/lib/content";

/**
 * Chat screen — server component that loads SME content (just the
 * starter prompts, in this case) and hands it to the Chat client
 * component which owns useChat() state.
 */
export default async function ChatPage() {
  const { starters } = await loadContent();

  return (
    <div className="flex h-[100svh] flex-col">
      <header className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="opacity-90 hover:opacity-100">
            <WillowMark />
          </Link>
          <span className="text-xs text-muted-foreground">
            Conversations are not stored
          </span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl px-4 pt-4 sm:px-6">
        <SafetyDisclaimer />
      </div>

      <div className="mx-auto w-full max-w-3xl flex-1 min-h-0 px-4 py-4 sm:px-6">
        <Chat starters={starters} />
      </div>
    </div>
  );
}
