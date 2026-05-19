import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Chat } from "@/components/chat/chat";
import { SafetyDisclaimer } from "@/components/chat/safety-disclaimer";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { WillowMark } from "@/components/willow-mark";
import { getConversation, listMessages } from "@/lib/db/queries";
import { dbRowsToUiMessages } from "@/lib/db/persist-messages";
import { loadContent } from "@/lib/content";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ conversationId: string }> };

export default async function ChatConversationPage({ params }: Props) {
  const { conversationId } = await params;
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

  const [content, rows] = await Promise.all([
    loadContent(),
    listMessages(conversationId),
  ]);
  const initialMessages = dbRowsToUiMessages(rows);

  return (
    <div className="flex h-[100svh] flex-col">
      <header className="border-b border-border/40">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="opacity-90 hover:opacity-100">
            <WillowMark />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/sources"
              className="hidden text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:inline"
            >
              Sources
            </Link>
            <span className="hidden text-xs text-muted-foreground md:inline">
              CBT companion
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl px-4 pt-4 sm:px-6">
        <SafetyDisclaimer />
      </div>

      <div className="mx-auto w-full max-w-3xl flex-1 min-h-0 px-4 py-4 sm:px-6">
        <Chat
          starters={content.starters}
          conversationId={conversationId}
          initialMessages={initialMessages}
        />
      </div>
    </div>
  );
}
