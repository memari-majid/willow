import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { HOW_WILLOW_WORKS } from "@/lib/site-nav";
import { SETTINGS_COPY } from "@/lib/site-copy";

import { SettingsDataClient } from "./settings-data-client";
import { SettingsNav } from "../settings-nav";
import { WillowMark } from "@/components/willow-mark";

export const dynamic = "force-dynamic";

export default async function SettingsDataPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  return (
    <div className="mx-auto min-h-[100svh] w-full max-w-lg px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/chat">
          <WillowMark />
        </Link>
        <SettingsNav active="data" />
      </header>

      <h1 className="text-lg font-medium">Your data</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Export or delete everything Willow stores for your account. See{" "}
        <Link href={HOW_WILLOW_WORKS.href} className="underline">
          {HOW_WILLOW_WORKS.navLabel}
        </Link>{" "}
        for {SETTINGS_COPY.dataLead}.
      </p>

      <div className="mt-6">
        <SettingsDataClient />
      </div>
    </div>
  );
}
