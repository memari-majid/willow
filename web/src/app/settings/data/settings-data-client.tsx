"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { WillowMark } from "@/components/willow-mark";
import { SETTINGS_COPY } from "@/lib/site-copy";

import { SettingsNav } from "../settings-nav";
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
      !window.confirm(SETTINGS_COPY.deleteConfirm)
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
        {exporting ? "Preparing…" : SETTINGS_COPY.downloadData}
      </Button>

      <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <h2 className="text-sm font-medium text-destructive">Delete account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {SETTINGS_COPY.deleteDetail}
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
      <SettingsNav active="data" />
    </header>
  );
}
