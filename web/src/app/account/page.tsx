import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AccountForm } from "./account-form";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in?callbackUrl=/account");

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold tracking-tight">Account</h1>
      <p className="mt-1 text-sm text-muted-foreground">{session.user.email}</p>
      <AccountForm defaultName={session.user.name ?? ""} />
    </div>
  );
}
