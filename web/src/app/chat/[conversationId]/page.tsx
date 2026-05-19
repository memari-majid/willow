import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ChatMenuButton } from "@/components/chat/conversation-sidebar";
import { Chat } from "@/components/chat/chat";
import { SafetyDisclaimer } from "@/components/chat/safety-disclaimer";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getConversation, listMessages } from "@/lib/db/queries";
import { dbRowsToUiMessages } from "@/lib/db/persist-messages";
import { loadContent } from "@/lib/content";
import { loadWikiPages } from "@/lib/wiki/load";
import { buildWikiLinkRegistry } from "@/lib/wiki/link-registry";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ conversationId: string }>;
  searchParams: Promise<{ prefill?: string }>;
};

export default async function ChatConversationPage({
  params,
  searchParams,
}: Props) {
  const { conversationId } = await params;
  const { prefill } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const convo = await getConversation(conversationId, session.user.id);
  if (!convo) {
    return (
      <div className="mx-auto max-w-md p-8 text-center text-sm">
        Conversation not found.{" "}
        <Link href="/chat" className="underline">
          Start again
        </Link>
      </div>
    );
  }

  const [content, rows, wikiPages] = await Promise.all([
    loadContent(),
    listMessages(conversationId),
    loadWikiPages(),
  ]);
  const wikiLinkRegistry = buildWikiLinkRegistry(wikiPages);
  const initialMessages = dbRowsToUiMessages(rows);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="border-b border-border/40">
        <div className="flex w-full items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <ChatMenuButton />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {convo.title?.trim() || "New conversation"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Cognitive behavioral therapy companion
              </p>
            </div>
          </div>
          <div className="hidden shrink-0 items-center gap-3 md:flex">
            <Link
              href="/settings"
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Settings
            </Link>
            <Link
              href="/wiki"
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Wiki
            </Link>
            <Link
              href="/sources"
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Sources
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="px-4 pt-4 sm:px-6">
        <SafetyDisclaimer />
      </div>

      <div className="min-h-0 flex-1 px-4 py-4 sm:px-6">
        <Chat
          starters={content.starters}
          conversationId={conversationId}
          initialMessages={initialMessages}
          prefill={prefill}
          wikiLinkRegistry={wikiLinkRegistry}
        />
      </div>
    </div>
  );
}
