import Link from "next/link";

import { Chat } from "@/components/chat/chat";
import { DraftBanner } from "@/components/chat/draft-banner";
import { SafetyDisclaimer } from "@/components/chat/safety-disclaimer";
import { WillowMark } from "@/components/willow-mark";
import { isReadyForUsers, loadContent, REQUIRED_SME_FILES } from "@/lib/content";

/**
 * Chat screen — server component that loads SME content (just the
 * starter prompts and readiness state) and hands it to the Chat
 * client component which owns useChat() state.
 */
export default async function ChatPage() {
  const content = await loadContent();
  const ready = isReadyForUsers(content);
  const required = new Set<string>(REQUIRED_SME_FILES);
  const unready = content.status.filter(
    (s) => required.has(s.relativePath) && !s.ready,
  );

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

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 pt-4 sm:px-6">
        {!ready && <DraftBanner unreadyCount={unready.length} />}
        <SafetyDisclaimer />
      </div>

      <div className="mx-auto w-full max-w-3xl flex-1 min-h-0 px-4 py-4 sm:px-6">
        <Chat starters={content.starters} />
      </div>
    </div>
  );
}
