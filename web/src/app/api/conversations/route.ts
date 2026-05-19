import { auth } from "@/auth";
import { createConversation, listConversationsForUser } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const rows = await listConversationsForUser(session.user.id);
  return Response.json({ conversations: rows });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  let title: string | undefined;
  try {
    const body = (await req.json()) as { title?: string };
    title = body.title;
  } catch {
    /* optional body */
  }
  const conv = await createConversation(session.user.id, title);
  return Response.json({ conversation: conv });
}
