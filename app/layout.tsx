import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import { CommandPalette } from "@/components/cli/CommandPalette";
import { PageEntryOverlay } from "@/components/layout/PageEntryOverlay";
import { ModeTransitionOverlay } from "@/components/layout/ModeTransitionOverlay";
import { GenerativeBackground } from "@/components/canvas/GenerativeBackground";
import { InfiniteGrid } from "@/components/ui/infinite-grid";
import { ThemeApplier } from "@/components/providers/ThemeApplier";
import { ModeApplier } from "@/components/providers/ModeApplier";
import { CursorProvider } from "@/components/providers/CursorProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-ui",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HW | Lume-Glass Portfolio",
  description: "Creative Developer Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-[#050505]`}
      >
        <ThemeApplier />
        <ModeApplier />
        <CursorProvider />
        <GenerativeBackground />
        <InfiniteGrid />
        <PageEntryOverlay />
        <ModeTransitionOverlay />
        <CommandPalette />
        {children}
      </body>
    </html>
  );
}

// Shimmer Revamp Cache Invalidator


