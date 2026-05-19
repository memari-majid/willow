import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ChatShell } from "@/components/chat/chat-shell";
import { getUserById } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function ChatAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/chat");
  }
  const user = await getUserById(session.user.id);
  if (!user?.onboardingCompletedAt) {
    redirect("/onboarding");
  }
  return <ChatShell userId={session.user.id}>{children}</ChatShell>;
}
