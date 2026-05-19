import { listConversationsForUser } from "@/lib/db/queries";

import { ChatSidebarProvider } from "./chat-sidebar-context";
import {
  ConversationSidebar,
  MobileSidebarDrawer,
  type ConversationRow,
} from "./conversation-sidebar";

export async function ChatShell({
  userId,
  children,
}: {
  userId: string;
  children: React.ReactNode;
}) {
  const rows = await listConversationsForUser(userId);
  const conversations: ConversationRow[] = rows.map((c) => ({
    id: c.id,
    title: c.title,
    updatedAt: c.updatedAt,
  }));

  return (
    <ChatSidebarProvider>
      <div className="flex h-[100svh] min-h-0 pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]">
        <div className="hidden md:flex">
          <ConversationSidebar conversations={conversations} />
        </div>
        <MobileSidebarDrawer conversations={conversations} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </ChatSidebarProvider>
  );
}
