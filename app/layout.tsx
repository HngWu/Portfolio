import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import { CommandPalette } from "@/components/cli/CommandPalette";
import { UnifiedTransitionOverlay } from "@/components/layout/UnifiedTransitionOverlay";
import { ModeTransitionOverlay } from "@/components/layout/ModeTransitionOverlay";
import { InitialLoaderOverlay } from "@/components/layout/InitialLoaderOverlay";
import { ArcaneBackground } from "@/components/background/ArcaneBackground";
import { ThemeApplier } from "@/components/providers/ThemeApplier";
import { ModeApplier } from "@/components/providers/ModeApplier";
import { CursorProvider } from "@/components/providers/CursorProvider";
import { PerformanceMonitor } from "@/components/performance/PerformanceMonitor";
import { PageTransitionsProvider } from "@/components/providers/PageTransitionsProvider";
import { getPageTransitions } from "@/app/actions/page-transitions";
import { getPortfolioContent, getSearchableContent } from "@/lib/content/portfolio";
import { Navbar } from "@/components/nav/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-ui",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#050505",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: {
    default: "Portfolio",
    template: "%s | Portfolio",
  },
  description: "Creative Developer & Software Engineer Portfolio",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getPortfolioContent();
  const searchableContent = getSearchableContent(content);
  const transitionRules = await getPageTransitions();

  return (
    <html lang="en" className="dark overflow-x-hidden" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-[#050505] overflow-x-hidden w-full max-w-full min-h-screen relative`}
      >
        <InitialLoaderOverlay />
        <ThemeApplier />
        <ModeApplier />
        <CursorProvider />
        <PerformanceMonitor />
        <ArcaneBackground />
        <ModeTransitionOverlay />
        <UnifiedTransitionOverlay />
        <CommandPalette initialContent={searchableContent} />
        <Navbar />
        <PageTransitionsProvider initialRules={transitionRules}>
          {children}
        </PageTransitionsProvider>
      </body>
    </html>
  );
}
