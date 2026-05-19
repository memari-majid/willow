import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { createConversation } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ prompt?: string }> };

export default async function ChatStartPage({ searchParams }: Props) {
  const session = await auth();
  const { prompt } = await searchParams;

  if (!session?.user?.id) {
    const callback = prompt
      ? `/chat/start?prompt=${encodeURIComponent(prompt)}`
      : "/chat";
    redirect(`/sign-in?callbackUrl=${encodeURIComponent(callback)}`);
  }

  const convo = await createConversation(session.user.id, "New conversation");
  const base = `/chat/${convo.id}`;
  if (prompt?.trim()) {
    redirect(`${base}?prefill=${encodeURIComponent(prompt.trim())}`);
  }
  redirect(base);
}
