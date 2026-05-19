import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  createConversation,
  listConversationsForUser,
} from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function ChatIndexPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const list = await listConversationsForUser(session.user.id);
  if (list.length === 0) {
    const c = await createConversation(session.user.id, "Conversation");
    redirect(`/chat/${c.id}`);
  }
  redirect(`/chat/${list[0]!.id}`);
}
