"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { WillowMark } from "@/components/willow-mark";

import { deleteAccountAction, exportDataAction } from "../actions";

export function SettingsDataClient() {
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const json = await exportDataAction();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `willow-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        "Delete your account and all stored data? This cannot be undone.",
      )
    ) {
      return;
    }
    setDeleting(true);
    await deleteAccountAction();
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleExport}
        disabled={exporting}
      >
        {exporting ? "Preparing…" : "Download JSON export"}
      </Button>

      <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <h2 className="text-sm font-medium text-destructive">Delete account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanently removes your profile, conversations (and per-thread
          summaries), mood data, memories, and preferences.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-3 border-destructive/50 text-destructive"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting…" : "Delete my account"}
        </Button>
      </div>
    </>
  );
}

export function SettingsDataNav() {
  return (
    <header className="mb-8 flex items-center justify-between">
      <Link href="/chat">
        <WillowMark />
      </Link>
      <nav className="flex gap-3 text-xs">
        <Link href="/settings" className="underline-offset-4 hover:underline">
          Preferences
        </Link>
        <Link href="/settings/memory" className="underline-offset-4 hover:underline">
          Memory
        </Link>
      </nav>
    </header>
  );
}
