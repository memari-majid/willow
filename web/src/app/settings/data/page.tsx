import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { HOW_WILLOW_WORKS } from "@/lib/site-nav";

import { SettingsDataClient, SettingsDataNav } from "./settings-data-client";

export const dynamic = "force-dynamic";

export default async function SettingsDataPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  return (
    <div className="mx-auto min-h-[100svh] w-full max-w-lg px-4 py-8">
      <SettingsDataNav />

      <h1 className="text-lg font-medium">Your data</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Export or delete everything Willow stores for your account. See{" "}
        <Link href={HOW_WILLOW_WORKS.href} className="underline">
          {HOW_WILLOW_WORKS.navLabel}
        </Link>{" "}
        for clinical content provenance.
      </p>

      <div className="mt-6">
        <SettingsDataClient />
      </div>
    </div>
  );
}
