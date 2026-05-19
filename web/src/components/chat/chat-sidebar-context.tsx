"use client";

import { createContext, useContext, useState } from "react";

type ChatSidebarContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const ChatSidebarContext = createContext<ChatSidebarContextValue | null>(null);

export function ChatSidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <ChatSidebarContext.Provider
      value={{
        open,
        setOpen,
        toggle: () => setOpen((v) => !v),
      }}
    >
      {children}
    </ChatSidebarContext.Provider>
  );
}

export function useChatSidebar() {
  const ctx = useContext(ChatSidebarContext);
  if (!ctx) {
    throw new Error("useChatSidebar must be used within ChatSidebarProvider");
  }
  return ctx;
}
