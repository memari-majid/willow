import type { Metadata, Viewport } from "next";

import { PrivateSessionBoundary } from "@/components/private-session-boundary";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "Willow — A gentle space to talk things through",
  description:
    "Practice cognitive behavioral skills in conversation with Willow — warm, direct, and grounded in a clinician's guide. Not therapy. Not a crisis line.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7f6f2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-background text-foreground">
        <nav className="portfolio-brand" aria-label="Project portfolio">
          <span>Majid Memari · Project portfolio</span>
          <a href="https://www.majidmemari.com/projects">All projects ↗</a>
        </nav>
        <PrivateSessionBoundary>
          <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        </PrivateSessionBoundary>
      </body>
    </html>
  );
}
