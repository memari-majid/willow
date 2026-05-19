import { z } from "zod";

import { auth } from "@/auth";
import {
  deleteConversation,
  renameConversation,
} from "@/lib/db/queries";

export const dynamic = "force-dynamic";

const PATCH_BODY = z.object({
  title: z.string().min(1).max(120),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  let body: z.infer<typeof PATCH_BODY>;
  try {
    body = PATCH_BODY.parse(await req.json());
  } catch {
    return new Response("Invalid body", { status: 400 });
  }

  const row = await renameConversation(id, session.user.id, body.title.trim());
  if (!row) {
    return new Response("Not found", { status: 404 });
  }
  return Response.json({ conversation: row });
}

export async function DELETE(_req: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  const row = await deleteConversation(id, session.user.id);
  if (!row) {
    return new Response("Not found", { status: 404 });
  }
  return Response.json({ ok: true });
}
