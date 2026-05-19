"use client";

import { BookOpen, Menu, Pencil, Plus, Settings, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { useChatSidebar } from "@/components/chat/chat-sidebar-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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

function SidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  const linkClass =
    "flex min-h-9 items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground";

  return (
    <div className="shrink-0 border-t border-border/40 p-2 md:hidden">
      <nav className="flex flex-col gap-0.5" aria-label="App navigation">
        <Link href="/settings" className={linkClass} onClick={onNavigate}>
          <Settings className="size-4 shrink-0" aria-hidden />
          Settings
        </Link>
        <Link href="/sources" className={linkClass} onClick={onNavigate}>
          <BookOpen className="size-4 shrink-0" aria-hidden />
          Sources
        </Link>
        <div className="px-1">
          <SignOutButton className="h-9 w-full justify-start px-2 text-sm" />
        </div>
      </nav>
    </div>
  );
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
  const [renameTarget, setRenameTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

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

  function openRename(id: string, current: string | null) {
    setRenameTarget({ id, title: current ?? "New conversation" });
    setRenameValue(current?.trim() || "New conversation");
  }

  async function confirmRename() {
    if (!renameTarget) return;
    const next = renameValue.trim();
    if (!next) return;
    setBusy(renameTarget.id);
    try {
      await fetch(`/api/conversations/${renameTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: next }),
      });
      setRenameTarget(null);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setBusy(id);
    try {
      await resDelete(id);
      const isActive = pathname === `/chat/${id}`;
      setDeleteTarget(null);
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
    <>
      <aside
        className={cn(
          "flex h-full w-64 shrink-0 flex-col border-r border-border/40 bg-card/30",
          className,
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border/40 px-3 py-3">
          <Link
            href="/"
            className="opacity-90 hover:opacity-100"
            onClick={onNavigate}
          >
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
                    <div
                      className={cn(
                        "flex shrink-0 gap-0.5 opacity-100 transition-opacity",
                        "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100",
                      )}
                    >
                      <button
                        type="button"
                        aria-label="Rename"
                        disabled={busy === c.id}
                        className="flex min-h-9 min-w-9 items-center justify-center rounded-md p-2 hover:bg-background/80"
                        onClick={() => openRename(c.id, c.title)}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete"
                        disabled={busy === c.id}
                        className="flex min-h-9 min-w-9 items-center justify-center rounded-md p-2 hover:bg-background/80"
                        onClick={() => setDeleteTarget(c.id)}
                      >
                        <Trash2 className="size-4" />
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

        <SidebarFooter onNavigate={onNavigate} />
      </aside>

      <Dialog
        open={renameTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename conversation</DialogTitle>
            <DialogDescription>
              Choose a name you will recognize in the sidebar.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            aria-label="Conversation title"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void confirmRename();
              }
            }}
          />
          <DialogFooter className="mt-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRenameTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!renameValue.trim() || busy === renameTarget?.id}
              onClick={() => void confirmRename()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete conversation?</DialogTitle>
            <DialogDescription>
              This removes the conversation and all its messages. This cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={busy === deleteTarget}
              onClick={() => void confirmDelete()}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/40 md:hidden"
        aria-label="Conversations"
        className={cn(
          "fixed inset-y-0 left-0 top-0 z-50 flex h-full w-64 max-w-[min(100vw,20rem)] flex-col gap-0 rounded-none border-0 p-0 shadow-xl",
          "translate-x-0 translate-y-0 sm:max-w-none",
          "data-open:animate-in data-open:slide-in-from-left data-open:fade-in-0",
          "data-closed:animate-out data-closed:slide-out-to-left data-closed:fade-out-0",
          "md:hidden",
        )}
      >
        <ConversationSidebar
          conversations={conversations}
          onNavigate={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export function ChatMenuButton() {
  const { toggle } = useChatSidebar();
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className="size-10 shrink-0 md:hidden"
      aria-label="Open conversations"
      onClick={toggle}
    >
      <Menu className="size-5" />
    </Button>
  );
}
