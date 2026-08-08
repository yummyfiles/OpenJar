import type { Metadata, Viewport } from "next";
import { Inter, Share_Tech_Mono } from "next/font/google";
import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/toaster";
import { ScrollProgress } from "@/components/scroll-progress";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BASE_URL ?? "http://localhost:3000"),
  title: {
    default: "OpenJar — Open support for open creators",
    template: "%s · OpenJar"
  },
  description:
    "Support developers, artists, musicians, writers, and creators building amazing things. Free & open-source funding for open creators.",
  openGraph: {
    title: "OpenJar",
    description: "Open support for open creators.",
    type: "website",
    siteName: "OpenJar"
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenJar",
    description: "Open support for open creators."
  }
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${shareTechMono.variable} flex min-h-screen flex-col`}>
        <MotionConfig reducedMotion="user">
          <ThemeProvider>
            <ScrollProgress />
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <Toaster />
          </ThemeProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
