"use client";

import { Menu, Pencil, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { useChatSidebar } from "@/components/chat/chat-sidebar-context";
import { Button } from "@/components/ui/button";
import { WillowMark } from "@/components/willow-mark";
import { cn } from "@/lib/utils";

export type ConversationRow = {
  id: string;
  title: string | null;
  updatedAt: Date | string;
};

function formatRelativeTime(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function ConversationSidebar({
  conversations,
  className,
  onNavigate,
}: {
  conversations: ConversationRow[];
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function handleNewChat() {
    setBusy("new");
    try {
      const res = await fetch("/api/conversations", { method: "POST" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        conversation: { id: string };
      };
      onNavigate?.();
      router.push(`/chat/${data.conversation.id}`);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function handleRename(id: string, current: string | null) {
    const next = window.prompt("Rename conversation", current ?? "New conversation");
    if (!next?.trim()) return;
    setBusy(id);
    try {
      await fetch(`/api/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: next.trim() }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this conversation and its messages?")) return;
    setBusy(id);
    try {
      await resDelete(id);
      const isActive = pathname === `/chat/${id}`;
      onNavigate?.();
      if (isActive) {
        router.push("/chat");
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-border/40 bg-card/30",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/40 px-3 py-3">
        <Link href="/" className="opacity-90 hover:opacity-100" onClick={onNavigate}>
          <WillowMark />
        </Link>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 gap-1 text-xs"
          disabled={busy === "new"}
          onClick={() => void handleNewChat()}
        >
          <Plus className="size-3.5" />
          New chat
        </Button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {conversations.map((c) => {
            const href = `/chat/${c.id}`;
            const active = pathname === href;
            const title = c.title?.trim() || "New conversation";
            return (
              <li key={c.id}>
                <div
                  className={cn(
                    "group flex items-start gap-1 rounded-lg px-2 py-2 text-sm transition-colors",
                    active
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <Link
                    href={href}
                    onClick={onNavigate}
                    className="min-w-0 flex-1"
                  >
                    <p className="truncate font-medium">{title}</p>
                    <p className="text-[10px] opacity-70">
                      {formatRelativeTime(c.updatedAt)}
                    </p>
                  </Link>
                  <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      aria-label="Rename"
                      disabled={busy === c.id}
                      className="rounded p-1 hover:bg-background/80"
                      onClick={() => void handleRename(c.id, c.title)}
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete"
                      disabled={busy === c.id}
                      className="rounded p-1 hover:bg-background/80"
                      onClick={() => void handleDelete(c.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {conversations.length === 0 && (
          <p className="px-2 py-4 text-xs text-muted-foreground">
            No conversations yet. Start a new chat.
          </p>
        )}
      </nav>
    </aside>
  );
}

async function resDelete(id: string) {
  await fetch(`/api/conversations/${id}`, { method: "DELETE" });
}

export function MobileSidebarDrawer({
  conversations,
}: {
  conversations: ConversationRow[];
}) {
  const { open, setOpen } = useChatSidebar();

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        className="fixed inset-0 z-40 bg-black/40 md:hidden"
        onClick={() => setOpen(false)}
      />
      <div className="fixed inset-y-0 left-0 z-50 md:hidden">
        <ConversationSidebar
          conversations={conversations}
          onNavigate={() => setOpen(false)}
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="absolute right-2 top-2"
          onClick={() => setOpen(false)}
        >
          <X className="size-4" />
        </Button>
      </div>
    </>
  );
}

export function ChatMenuButton() {
  const { toggle } = useChatSidebar();
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className="md:hidden"
      aria-label="Open conversations"
      onClick={toggle}
    >
      <Menu className="size-5" />
    </Button>
  );
}
